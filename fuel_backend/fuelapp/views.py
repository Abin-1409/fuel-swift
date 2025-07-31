from django.shortcuts import render, get_object_or_404
from .models import CustomUser, Service, ServiceRequest, AgentRegistrationRequest, RejectedAgentEmail, Payment
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from rest_framework import serializers
from decimal import Decimal
from rest_framework.parsers import MultiPartParser, FormParser
from django.db import models
import razorpay
from django.conf import settings

# Create your views here.

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

class ServiceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceRequest
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'first_name', 'last_name', 'email', 'phone_number', 'address', 'photo', 'is_active', 'is_staff', 'user_type']

class AgentRegistrationRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentRegistrationRequest
        fields = '__all__'

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    data = request.data
    required_fields = ['first_name', 'last_name', 'email', 'phone_number', 'password', 'confirm_password']
    for field in required_fields:
        if field not in data or not data[field]:
            return Response({'message': f'Missing field: {field}'}, status=status.HTTP_400_BAD_REQUEST)
    if data['password'] != data['confirm_password']:
        return Response({'message': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)
    if CustomUser.objects.filter(phone_number=data['phone_number']).exists():
        return Response({'message': 'User with this phone number already exists'}, status=status.HTTP_400_BAD_REQUEST)
    user = CustomUser.objects.create_user(
        phone_number=data['phone_number'],
        password=data['password'],
        email=data['email'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        address=data.get('address', ''),
        photo=request.FILES.get('photo').name if 'photo' in request.FILES else '',
        user_type='user'
    )
    return Response({'message': 'Registration successful'}, status=status.HTTP_201_CREATED)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    data = request.data
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return Response({'message': 'Email and password required'}, status=status.HTTP_400_BAD_REQUEST)
    user = authenticate(request, email=email, password=password)
    if user is not None:
        return Response({
            'message': 'Login successful',
            'first_name': user.first_name,
            'is_staff': user.is_staff,
            'user_type': user.user_type
        }, status=status.HTTP_200_OK)
    else:
        return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# Service Management APIs
@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def service_list(request):
    """Get all services"""
    services = Service.objects.all()
    serializer = ServiceSerializer(services, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def service_create(request):
    """Create a new service"""
    serializer = ServiceSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def service_detail(request, pk):
    """Get, update, or delete a specific service"""
    try:
        service = Service.objects.get(pk=pk)
    except Service.DoesNotExist:
        return Response({'message': 'Service not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ServiceSerializer(service)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        serializer = ServiceSerializer(service, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        service.delete()
        return Response({'message': 'Service deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

# Service Request APIs
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def create_service_request(request):
    print('DEBUG: Received service request data:', request.data)
    """Create a new service request"""
    try:
        data = request.data
        
        # Get service
        service_type = data.get('service_type')
        try:
            service = Service.objects.get(type=service_type, status='active')
        except Service.DoesNotExist:
            return Response({'message': 'Service not available'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get user (you might want to get this from authentication token)
        user_email = data.get('user_email')
        print('DEBUG: Searching for user_email:', user_email)
        print('DEBUG: All user emails:', list(CustomUser.objects.values_list('email', flat=True)))
        try:
            user = CustomUser.objects.get(email=user_email)
        except CustomUser.DoesNotExist:
            print('DEBUG: User not found by email, trying phone_number...')
            try:
                user = CustomUser.objects.get(phone_number=user_email)
            except CustomUser.DoesNotExist:
                print('DEBUG: User not found by phone_number either.')
                return Response({'message': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate quantity and amount
        quantity_liters = data.get('quantity_liters')
        amount_rupees = data.get('amount_rupees')
        total_amount = 0

        if service.type in ['petrol', 'diesel']:
            if quantity_liters:
                quantity_liters = Decimal(quantity_liters)
                total_amount = quantity_liters * service.price
                amount_rupees = total_amount
            elif amount_rupees:
                amount_rupees = Decimal(amount_rupees)
                quantity_liters = amount_rupees / service.price
                total_amount = amount_rupees
            else:
                return Response({'message': 'Either quantity_liters or amount_rupees must be provided'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # For non-fuel services, use total_amount from frontend
            total_amount = Decimal(data.get('total_amount', 0))
        
        # Check stock for fuel services
        if service.type in ['petrol', 'diesel'] and quantity_liters > service.stock:
            return Response({'message': f'Only {service.stock} liters available'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create service request
        service_request = ServiceRequest.objects.create(
            user=user,
            service=service,
            vehicle_type=data.get('vehicle_type'),
            vehicle_number=data.get('vehicle_number'),
            quantity_liters=quantity_liters,
            amount_rupees=amount_rupees,
            total_amount=total_amount,
            delivery_time=data.get('delivery_time'),
            location_lat=data.get('location_lat'),
            location_lng=data.get('location_lng'),
            notes=data.get('notes', '')
        )
        
        # Update stock for fuel services
        if service.type in ['petrol', 'diesel']:
            service.stock -= quantity_liters
            service.save()
        
        # Create Payment object (status: initiated)
        payment_method = data.get('payment_method', 'initiated')  # 'cod' or 'initiated'
        payment_status = 'cod' if payment_method == 'cod' else 'initiated'
        payment = Payment.objects.create(
            user=user,
            service_request=service_request,
            amount=total_amount,
            status=payment_status,
            method=payment_method if payment_method else 'razorpay',
        )
        
        serializer = ServiceRequestSerializer(service_request)
        return Response({
            'message': 'Service request created successfully',
            'request': serializer.data,
            'payment_id': payment.id,
            'total_amount': str(total_amount)
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print('DEBUG: Error in create_service_request:', str(e))
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def get_service_by_type(request, service_type):
    """Get service details by type"""
    try:
        service = Service.objects.get(type=service_type, status='active')
        serializer = ServiceSerializer(service)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Service.DoesNotExist:
        return Response({'message': 'Service not found'}, status=status.HTTP_404_NOT_FOUND)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])  # You may want to restrict this to admin users only
def user_list(request):
    users = CustomUser.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@csrf_exempt
@api_view(['DELETE'])
@permission_classes([AllowAny])
def user_delete(request, user_id):
    try:
        user = get_object_or_404(CustomUser, id=user_id)
        if user.is_staff:
            return Response({'message': 'Cannot delete admin/staff users.'}, status=status.HTTP_403_FORBIDDEN)
        user.delete()
        return Response({'message': 'User deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        print(f"Error deleting user: {e}")
        return Response({'message': f'Error deleting user: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def air_service_prices(request):
    try:
        air_service = Service.objects.get(type='air')
        return Response({
            'price_per_tyre': float(air_service.price_per_tyre),
            'leak_detection_price': float(air_service.leak_detection_price)
        })
    except Service.DoesNotExist:
        return Response({'error': 'Air service not found'}, status=404)

@api_view(['GET'])
def electric_service_prices(request):
    try:
        ev_service = Service.objects.get(type='ev')
        return Response({
            'price_basic': float(ev_service.price_basic),
            'price_type2': float(ev_service.price_type2),
            'price_ccs': float(ev_service.price_ccs),
            'price_chademo': float(ev_service.price_chademo),
            'price_bharat_dc': float(ev_service.price_bharat_dc)
        })
    except Service.DoesNotExist:
        return Response({'error': 'EV service not found'}, status=404)

@api_view(['GET'])
def mechanical_service_prices(request):
    try:
        mech_service = Service.objects.get(type='mechanical')
        return Response({
            'price_dead_battery': float(mech_service.price_dead_battery),
            'price_flat_tyre': float(mech_service.price_flat_tyre),
            'price_overheating': float(mech_service.price_overheating),
            'price_brake_issues': float(mech_service.price_brake_issues),
            'price_starter_motor': float(mech_service.price_starter_motor),
            'price_clutch_gear': float(mech_service.price_clutch_gear),
            'price_electrical': float(mech_service.price_electrical),
            'price_fluid_leak': float(mech_service.price_fluid_leak),
            'price_chain_belt': float(mech_service.price_chain_belt),
            'price_key_lockout': float(mech_service.price_key_lockout)
        })
    except Service.DoesNotExist:
        return Response({'error': 'Mechanical service not found'}, status=404)

@api_view(['GET'])
@permission_classes([AllowAny])
def available_mechanics(request):
    # Placeholder: return a static number of available mechanics
    return Response({'mechanics': 3})

@api_view(['GET'])
@permission_classes([AllowAny])
def available_air_technicians(request):
    # Placeholder: return a static number of available technicians
    return Response({'technicians': 2})

@api_view(['GET'])
@permission_classes([AllowAny])
def available_electric_chargers(request):
    # Placeholder: return a static number of available chargers
    return Response({'chargers': 1})

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def agent_registration_request(request):
    parser_classes = (MultiPartParser, FormParser)
    serializer = AgentRegistrationRequestSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Agent registration request submitted, pending admin approval.'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])  # You may want to restrict to admin only
def agent_registration_requests(request):
    requests = AgentRegistrationRequest.objects.all().order_by('-created_at')
    serializer = AgentRegistrationRequestSerializer(requests, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])  # You may want to restrict to admin only
def accept_agent_registration_request(request, req_id):
    try:
        reg_req = AgentRegistrationRequest.objects.get(id=req_id)
        # Create CustomUser
        if CustomUser.objects.filter(phone_number=reg_req.phone_number).exists():
            return Response({'message': 'User with this phone number already exists'}, status=status.HTTP_400_BAD_REQUEST)
        if CustomUser.objects.filter(email=reg_req.email).exists():
            return Response({'message': 'User with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        # Split full name
        name_parts = reg_req.full_name.strip().split()
        first_name = name_parts[0]
        last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
        # Store the full URL of the id_proof_file in the photo field for direct use in frontend
        id_proof_url = reg_req.id_proof_file.url if reg_req.id_proof_file else ''
        if not id_proof_url:
            return Response({'message': 'ID proof file is missing or not accessible.'}, status=status.HTTP_400_BAD_REQUEST)
        user = CustomUser.objects.create_user(
            phone_number=reg_req.phone_number,
            email=reg_req.email,
            password=reg_req.password,
            first_name=first_name,
            last_name=last_name,
            address='',
            photo=id_proof_url,  # Store the full URL
            user_type='agent'
        )
        reg_req.delete()
        return Response({'message': 'Agent registration accepted and user created.'}, status=status.HTTP_201_CREATED)
    except AgentRegistrationRequest.DoesNotExist:
        return Response({'message': 'Registration request not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def reject_agent_registration_request(request, req_id):
    try:
        reg_req = AgentRegistrationRequest.objects.get(id=req_id)
        # Store the rejected email
        RejectedAgentEmail.objects.get_or_create(email=reg_req.email)
        reg_req.delete()
        return Response({'message': 'Agent registration request rejected.'}, status=status.HTTP_200_OK)
    except AgentRegistrationRequest.DoesNotExist:
        return Response({'message': 'Registration request not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def agent_registration_status(request):
    email = request.GET.get('email')
    if not email:
        return Response({'message': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
    # Check if agent is approved
    if CustomUser.objects.filter(email=email, user_type='agent').exists():
        return Response({'status': 'approved'}, status=status.HTTP_200_OK)
    # Check if rejected
    if RejectedAgentEmail.objects.filter(email=email).exists():
        return Response({'status': 'rejected'}, status=status.HTTP_200_OK)
    # Check if request is pending
    if AgentRegistrationRequest.objects.filter(email=email).exists():
        return Response({'status': 'pending'}, status=status.HTTP_200_OK)
    return Response({'message': 'No registration found for this email.'}, status=status.HTTP_404_NOT_FOUND)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def create_razorpay_order(request):
    """Create a Razorpay order and return the order_id to the frontend."""
    data = request.data
    amount = data.get('amount')
    if not amount:
        return Response({'message': 'Amount is required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        order = client.order.create({
            'amount': int(float(amount) * 100),  # Razorpay expects paise
            'currency': 'INR',
            'payment_capture': 1
        })
        return Response({'order_id': order['id']}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'message': f'Error creating Razorpay order: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_razorpay_payment(request):
    """Verify Razorpay payment signature and update Payment status."""
    data = request.data
    payment_id = data.get('razorpay_payment_id')
    order_id = data.get('razorpay_order_id')
    signature = data.get('razorpay_signature')
    payment_db_id = data.get('payment_db_id')  # Our Payment model ID
    if not (payment_id and order_id and signature and payment_db_id):
        return Response({'message': 'Missing payment verification data'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        params_dict = {
            'razorpay_order_id': order_id,
            'razorpay_payment_id': payment_id,
            'razorpay_signature': signature
        }
        client.utility.verify_payment_signature(params_dict)
        # Update Payment model
        payment = Payment.objects.get(id=payment_db_id)
        payment.status = 'success'
        payment.payment_id = payment_id
        payment.method = 'razorpay'
        payment.save()
        return Response({'message': 'Payment verified and updated.'}, status=status.HTTP_200_OK)
    except razorpay.errors.SignatureVerificationError:
        payment = Payment.objects.get(id=payment_db_id)
        payment.status = 'failed'
        payment.save()
        return Response({'message': 'Payment signature verification failed.'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'message': f'Error verifying payment: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def service_requests_list(request):
    """Get all service requests with user and payment information"""
    try:
        requests = ServiceRequest.objects.select_related('user', 'service', 'payment').all().order_by('-created_at')
        
        request_data = []
        for req in requests:
            request_data.append({
                'id': req.id,
                'user_name': f"{req.user.first_name} {req.user.last_name}".strip() if req.user else 'N/A',
                'user_email': req.user.email if req.user else 'N/A',
                'user_phone': req.user.phone_number if req.user else 'N/A',
                'service_type': req.service.type if req.service else 'N/A',
                'vehicle_type': req.vehicle_type,
                'vehicle_number': req.vehicle_number,
                'quantity_liters': req.quantity_liters,
                'amount_rupees': req.amount_rupees,
                'total_amount': req.total_amount,
                'delivery_time': req.delivery_time,
                'location_lat': req.location_lat,
                'location_lng': req.location_lng,
                'notes': req.notes,
                'status': req.status,
                'created_at': req.created_at,
                'updated_at': req.updated_at,
                'payment_status': req.payment.status if req.payment else 'N/A',
                'payment_method': req.payment.method if req.payment else 'N/A',
                'payment_id': req.payment.payment_id if req.payment else None,
                'assigned_agent': {
                    'id': req.assigned_agent.id if req.assigned_agent else None,
                    'name': f"{req.assigned_agent.first_name} {req.assigned_agent.last_name}".strip() if req.assigned_agent else None,
                    'phone': req.assigned_agent.phone_number if req.assigned_agent else None,
                    'email': req.assigned_agent.email if req.assigned_agent else None
                } if req.assigned_agent else None,
            })
        
        return Response(request_data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['PUT'])
@permission_classes([AllowAny])
def update_service_request_status(request, request_id):
    """Update the status of a service request"""
    try:
        service_request = ServiceRequest.objects.get(id=request_id)
        new_status = request.data.get('status')
        
        if new_status not in ['pending', 'assigned', 'in_progress', 'completed', 'cancelled']:
            return Response({'message': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        service_request.status = new_status
        service_request.save()
        
        # Return the updated service request data along with the success message
        serializer = ServiceRequestSerializer(service_request)
        return Response({
            'message': 'Status updated successfully',
            'request': serializer.data
        }, status=status.HTTP_200_OK)
    except ServiceRequest.DoesNotExist:
        return Response({'message': 'Service request not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['PUT'])
@permission_classes([AllowAny])
def assign_agent_to_request(request, request_id):
    """Assign an agent to a service request"""
    try:
        service_request = ServiceRequest.objects.get(id=request_id)
        agent_id = request.data.get('agent_id')
        
        if agent_id:
            try:
                agent = CustomUser.objects.get(id=agent_id, user_type='agent')
                service_request.assigned_agent = agent
                service_request.status = 'assigned'
            except CustomUser.DoesNotExist:
                return Response({'message': 'Agent not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            service_request.assigned_agent = None
            service_request.status = 'pending'
        
        service_request.save()
        
        # Return the updated service request data along with the success message
        serializer = ServiceRequestSerializer(service_request)
        return Response({
            'message': 'Agent assigned successfully',
            'request': serializer.data
        }, status=status.HTTP_200_OK)
    except ServiceRequest.DoesNotExist:
        return Response({'message': 'Service request not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def available_agents(request):
    """Get all available agents for assignment"""
    try:
        agents = CustomUser.objects.filter(user_type='agent', is_active=True)
        agent_data = []
        for agent in agents:
            agent_data.append({
                'id': agent.id,
                'name': f"{agent.first_name} {agent.last_name}".strip(),
                'email': agent.email,
                'phone': agent.phone_number,
                'active_requests': ServiceRequest.objects.filter(assigned_agent=agent, status__in=['assigned', 'in_progress']).count()
            })
        
        return Response(agent_data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def agent_assigned_tasks(request):
    """Get all tasks assigned to a specific agent"""
    try:
        agent_email = request.GET.get('email')
        if not agent_email:
            return Response({'message': 'Agent email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find the agent by email
        try:
            agent = CustomUser.objects.get(email=agent_email, user_type='agent')
        except CustomUser.DoesNotExist:
            return Response({'message': 'Agent not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get all tasks assigned to this agent
        assigned_tasks = ServiceRequest.objects.filter(
            assigned_agent=agent
        ).select_related('user', 'service', 'payment').order_by('-created_at')
        
        tasks_data = []
        for task in assigned_tasks:
            tasks_data.append({
                'id': task.id,
                'user_name': f"{task.user.first_name} {task.user.last_name}".strip() if task.user else 'N/A',
                'user_phone': task.user.phone_number if task.user else 'N/A',
                'service_type': task.service.type if task.service else 'N/A',
                'service_name': task.service.name if task.service else 'N/A',
                'vehicle_type': task.vehicle_type,
                'vehicle_number': task.vehicle_number,
                'total_amount': task.total_amount,
                'delivery_time': task.delivery_time,
                'location_lat': task.location_lat,
                'location_lng': task.location_lng,
                'notes': task.notes,
                'status': task.status,
                'created_at': task.created_at,
                'payment_status': task.payment.status if task.payment else 'N/A',
                'payment_method': task.payment.method if task.payment else 'N/A',
            })
        
        return Response(tasks_data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def agent_dashboard_stats(request):
    """Get dashboard statistics for a specific agent"""
    try:
        agent_email = request.GET.get('email')
        if not agent_email:
            return Response({'message': 'Agent email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find the agent by email
        try:
            agent = CustomUser.objects.get(email=agent_email, user_type='agent')
        except CustomUser.DoesNotExist:
            return Response({'message': 'Agent not found'}, status=status.HTTP_404_NOT_FOUND)
        
        from datetime import datetime, timedelta
        today = datetime.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # Get assigned tasks
        all_assigned_tasks = ServiceRequest.objects.filter(assigned_agent=agent)
        today_tasks = all_assigned_tasks.filter(created_at__date=today)
        week_tasks = all_assigned_tasks.filter(created_at__date__gte=week_ago)
        month_tasks = all_assigned_tasks.filter(created_at__date__gte=month_ago)
        
        # Calculate statistics
        stats = {
            'today_requests': today_tasks.count(),
            'ongoing_tasks': all_assigned_tasks.filter(status__in=['assigned', 'in_progress']).count(),
            'completed_tasks': all_assigned_tasks.filter(status='completed').count(),
            'total_requests': all_assigned_tasks.count(),
            'earnings': {
                'today': float(today_tasks.aggregate(total=models.Sum('total_amount'))['total'] or 0),
                'week': float(week_tasks.aggregate(total=models.Sum('total_amount'))['total'] or 0),
                'month': float(month_tasks.aggregate(total=models.Sum('total_amount'))['total'] or 0)
            },
            'service_breakdown': {
                'petrol': all_assigned_tasks.filter(service__type='petrol').count(),
                'diesel': all_assigned_tasks.filter(service__type='diesel').count(),
                'ev': all_assigned_tasks.filter(service__type='ev').count(),
                'air': all_assigned_tasks.filter(service__type='air').count(),
                'mechanical': all_assigned_tasks.filter(service__type='mechanical').count()
            },
            'response_time': {
                'average': 12,  # Mock data - can be calculated based on actual response times
                'best': 8
            }
        }
        
        return Response(stats, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['PUT'])
@permission_classes([AllowAny])
def agent_update_task_status(request, task_id):
    """Allow agent to update the status of their assigned task"""
    try:
        agent_email = request.data.get('agent_email')
        new_status = request.data.get('status')
        
        if not agent_email or not new_status:
            return Response({'message': 'Agent email and status are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find the agent
        try:
            agent = CustomUser.objects.get(email=agent_email, user_type='agent')
        except CustomUser.DoesNotExist:
            return Response({'message': 'Agent not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Find the task assigned to this agent
        try:
            task = ServiceRequest.objects.get(id=task_id, assigned_agent=agent)
        except ServiceRequest.DoesNotExist:
            return Response({'message': 'Task not found or not assigned to you'}, status=status.HTTP_404_NOT_FOUND)
        
        if new_status not in ['assigned', 'in_progress', 'completed', 'cancelled']:
            return Response({'message': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        task.status = new_status
        task.save()
        
        # Return the updated task data along with the success message
        serializer = ServiceRequestSerializer(task)
        return Response({
            'message': 'Task status updated successfully',
            'request': serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def agent_assigned_tasks(request):
    """Get all tasks assigned to a specific agent"""
    try:
        agent_email = request.GET.get('email')
        if not agent_email:
            return Response({'message': 'Agent email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find the agent by email
        try:
            agent = CustomUser.objects.get(email=agent_email, user_type='agent')
        except CustomUser.DoesNotExist:
            return Response({'message': 'Agent not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get all tasks assigned to this agent
        assigned_tasks = ServiceRequest.objects.filter(
            assigned_agent=agent
        ).select_related('user', 'service', 'payment').order_by('-created_at')
        
        tasks_data = []
        for task in assigned_tasks:
            tasks_data.append({
                'id': task.id,
                'user_name': f"{task.user.first_name} {task.user.last_name}".strip() if task.user else 'N/A',
                'user_phone': task.user.phone_number if task.user else 'N/A',
                'service_type': task.service.type if task.service else 'N/A',
                'service_name': task.service.name if task.service else 'N/A',
                'vehicle_type': task.vehicle_type,
                'vehicle_number': task.vehicle_number,
                'total_amount': task.total_amount,
                'delivery_time': task.delivery_time,
                'location_lat': task.location_lat,
                'location_lng': task.location_lng,
                'notes': task.notes,
                'status': task.status,
                'created_at': task.created_at,
                'payment_status': task.payment.status if task.payment else 'N/A',
                'payment_method': task.payment.method if task.payment else 'N/A',
            })
        
        return Response(tasks_data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def agent_dashboard_stats(request):
    """Get dashboard statistics for a specific agent"""
    try:
        agent_email = request.GET.get('email')
        if not agent_email:
            return Response({'message': 'Agent email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find the agent by email
        try:
            agent = CustomUser.objects.get(email=agent_email, user_type='agent')
        except CustomUser.DoesNotExist:
            return Response({'message': 'Agent not found'}, status=status.HTTP_404_NOT_FOUND)
        
        from datetime import datetime, timedelta
        today = datetime.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # Get assigned tasks
        all_assigned_tasks = ServiceRequest.objects.filter(assigned_agent=agent)
        today_tasks = all_assigned_tasks.filter(created_at__date=today)
        week_tasks = all_assigned_tasks.filter(created_at__date__gte=week_ago)
        month_tasks = all_assigned_tasks.filter(created_at__date__gte=month_ago)
        
        # Calculate statistics
        stats = {
            'today_requests': today_tasks.count(),
            'ongoing_tasks': all_assigned_tasks.filter(status__in=['assigned', 'in_progress']).count(),
            'completed_tasks': all_assigned_tasks.filter(status='completed').count(),
            'total_requests': all_assigned_tasks.count(),
            'earnings': {
                'today': float(today_tasks.aggregate(total=models.Sum('total_amount'))['total'] or 0),
                'week': float(week_tasks.aggregate(total=models.Sum('total_amount'))['total'] or 0),
                'month': float(month_tasks.aggregate(total=models.Sum('total_amount'))['total'] or 0)
            },
            'service_breakdown': {
                'petrol': all_assigned_tasks.filter(service__type='petrol').count(),
                'diesel': all_assigned_tasks.filter(service__type='diesel').count(),
                'ev': all_assigned_tasks.filter(service__type='ev').count(),
                'air': all_assigned_tasks.filter(service__type='air').count(),
                'mechanical': all_assigned_tasks.filter(service__type='mechanical').count()
            },
            'response_time': {
                'average': 12,  # Mock data - can be calculated based on actual response times
                'best': 8
            }
        }
        
        return Response(stats, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['PUT'])
@permission_classes([AllowAny])
def agent_update_task_status(request, task_id):
    """Allow agent to update the status of their assigned task"""
    try:
        agent_email = request.data.get('agent_email')
        new_status = request.data.get('status')
        
        if not agent_email or not new_status:
            return Response({'message': 'Agent email and status are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find the agent
        try:
            agent = CustomUser.objects.get(email=agent_email, user_type='agent')
        except CustomUser.DoesNotExist:
            return Response({'message': 'Agent not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Find the task assigned to this agent
        try:
            task = ServiceRequest.objects.get(id=task_id, assigned_agent=agent)
        except ServiceRequest.DoesNotExist:
            return Response({'message': 'Task not found or not assigned to you'}, status=status.HTTP_404_NOT_FOUND)
        
        if new_status not in ['assigned', 'in_progress', 'completed', 'cancelled']:
            return Response({'message': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        task.status = new_status
        task.save()
        
        return Response({'message': 'Task status updated successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
