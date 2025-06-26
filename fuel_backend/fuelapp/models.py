from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# Create your models here.

class CustomUserManager(BaseUserManager):
    def create_user(self, phone_number, email, password=None, **extra_fields):
        if not phone_number:
            raise ValueError('The Phone Number must be set')
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(phone_number=phone_number, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(phone_number, email, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    phone_number = models.CharField(max_length=15, unique=True)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    address = models.TextField(blank=True)
    photo = models.CharField(max_length=255, blank=True, null=True)  # Store image URL or path
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    USER_TYPE_CHOICES = [
        ('user', 'User'),
        ('agent', 'Agent'),
    ]
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='user')

    objects = CustomUserManager()

    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name']

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Service(models.Model):
    SERVICE_TYPES = [
        ('petrol', 'Petrol'),
        ('diesel', 'Diesel'),
        ('ev', 'EV Charging'),
        ('air', 'Air Filling'),
        ('mechanical', 'Mechanical Work'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('maintenance', 'Maintenance'),
    ]
    
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=SERVICE_TYPES)
    description = models.TextField()
    stock = models.IntegerField(default=0)
    unit = models.CharField(max_length=20)  # liters, stations, pumps, mechanics
    price = models.DecimalField(max_digits=10, decimal_places=2)
    price_per_tyre = models.DecimalField(max_digits=10, decimal_places=2, default=10)
    leak_detection_price = models.DecimalField(max_digits=10, decimal_places=2, default=20)
    # EV Charging prices
    price_basic = models.DecimalField(max_digits=10, decimal_places=2, default=150)
    price_type2 = models.DecimalField(max_digits=10, decimal_places=2, default=200)
    price_ccs = models.DecimalField(max_digits=10, decimal_places=2, default=250)
    price_chademo = models.DecimalField(max_digits=10, decimal_places=2, default=250)
    price_bharat_dc = models.DecimalField(max_digits=10, decimal_places=2, default=180)
    # Mechanical issue prices
    price_dead_battery = models.DecimalField(max_digits=10, decimal_places=2, default=300)
    price_flat_tyre = models.DecimalField(max_digits=10, decimal_places=2, default=200)
    price_overheating = models.DecimalField(max_digits=10, decimal_places=2, default=350)
    price_brake_issues = models.DecimalField(max_digits=10, decimal_places=2, default=250)
    price_starter_motor = models.DecimalField(max_digits=10, decimal_places=2, default=400)
    price_clutch_gear = models.DecimalField(max_digits=10, decimal_places=2, default=350)
    price_electrical = models.DecimalField(max_digits=10, decimal_places=2, default=300)
    price_fluid_leak = models.DecimalField(max_digits=10, decimal_places=2, default=250)
    price_chain_belt = models.DecimalField(max_digits=10, decimal_places=2, default=200)
    price_key_lockout = models.DecimalField(max_digits=10, decimal_places=2, default=150)
    currency = models.CharField(max_length=3, default='INR')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.get_type_display()}"

    class Meta:
        ordering = ['-created_at']

class ServiceRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='service_requests')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='requests')
    vehicle_type = models.CharField(max_length=50)
    vehicle_number = models.CharField(max_length=20)
    quantity_liters = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    amount_rupees = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_time = models.DateTimeField()
    location_lat = models.DecimalField(max_digits=10, decimal_places=6)
    location_lng = models.DecimalField(max_digits=10, decimal_places=6)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.first_name} - {self.service.name} - {self.status}"

    class Meta:
        ordering = ['-created_at']

class AgentRegistrationRequest(models.Model):
    full_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15)
    email = models.EmailField()
    password = models.CharField(max_length=128)  # Store raw or hashed, to be handled on approval
    id_proof_type = models.CharField(max_length=50)
    id_proof_number = models.CharField(max_length=50)
    id_proof_file = models.FileField(upload_to='agent_id_proofs/')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.full_name} ({self.email}) - Pending Agent Registration"
