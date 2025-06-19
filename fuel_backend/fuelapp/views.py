from django.shortcuts import render
from .models import CustomUser
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt

# Create your views here.

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
        photo=request.FILES.get('photo').name if 'photo' in request.FILES else ''
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
    try:
        user_obj = CustomUser.objects.get(email=email)
        user = authenticate(phone_number=user_obj.phone_number, password=password)
    except CustomUser.DoesNotExist:
        user = None
    if user is not None:
        return Response({'message': 'Login successful'}, status=status.HTTP_200_OK)
    else:
        return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
