from django.shortcuts import render, get_object_or_404
from .models import CustomUser, Service, ServiceRequest, AgentRegistrationRequest, RejectedAgentEmail
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
        try:
            user = CustomUser.objects.get(email=user_email)
        except CustomUser.DoesNotExist:
            return Response({'message': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate quantity and amount
        quantity_liters = data.get('quantity_liters')
        amount_rupees = data.get('amount_rupees')
        total_amount = 0
        
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
        
        serializer = ServiceRequestSerializer(service_request)
        return Response({
            'message': 'Service request created successfully',
            'request': serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
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
