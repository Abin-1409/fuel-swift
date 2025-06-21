from django.contrib import admin
from .models import CustomUser, Service

# Register your models here.

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'stock', 'unit', 'price', 'currency', 'status', 'created_at']
    list_filter = ['type', 'status', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['-created_at']
