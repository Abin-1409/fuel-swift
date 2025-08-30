from django.urls import path
from .views import (
    register, login_view, service_list, service_create, service_detail, create_service_request, get_service_by_type, user_list, user_delete, air_service_prices, electric_service_prices, mechanical_service_prices, agent_registration_request, agent_registration_requests, accept_agent_registration_request, agent_registration_status,
    create_razorpay_order, verify_razorpay_payment, available_mechanics, available_air_technicians, available_electric_chargers,
    service_requests_list, update_service_request_status, assign_agent_to_request, available_agents,
    agent_assigned_tasks, agent_dashboard_stats, agent_update_task_status, update_payment_status
)

urlpatterns = [
    path('api/register/', register, name='register'),
    path('api/login/', login_view, name='login'),
    path('api/services/', service_list, name='service_list'),
    path('api/services/create/', service_create, name='service_create'),
    path('api/services/<int:pk>/', service_detail, name='service_detail'),
    path('api/service-request/create/', create_service_request, name='create_service_request'),
    path('api/services/type/<str:service_type>/', get_service_by_type, name='get_service_by_type'),
    path('api/users/', user_list, name='user_list'),
    path('api/users/<int:user_id>/', user_delete, name='user_delete'),
    path('api/services/air/prices/', air_service_prices, name='air_service_prices'),
    path('api/services/electric/prices/', electric_service_prices, name='electric_service_prices'),
    path('api/services/mechanical/prices/', mechanical_service_prices, name='mechanical_service_prices'),
    path('api/services/mechanical/mechanics', available_mechanics, name='available_mechanics'),
    path('api/services/air/technicians', available_air_technicians, name='available_air_technicians'),
    path('api/services/electric/chargers', available_electric_chargers, name='available_electric_chargers'),
    path('api/agent-registration-request/', agent_registration_request, name='agent_registration_request'),
    path('api/agent-registration-requests/', agent_registration_requests, name='agent_registration_requests'),
    path('api/agent-registration-request/<int:req_id>/accept/', accept_agent_registration_request, name='accept_agent_registration_request'),
    path('api/agent-registration-status/', agent_registration_status, name='agent_registration_status'),
    path('api/payment/create-order/', create_razorpay_order, name='create_razorpay_order'),
    path('api/payment/verify/', verify_razorpay_payment, name='verify_razorpay_payment'),
    # Service Request Management URLs
    path('api/service-requests/', service_requests_list, name='service_requests_list'),
    path('api/service-requests/<int:request_id>/update-status/', update_service_request_status, name='update_service_request_status'),
    path('api/service-requests/<int:request_id>/assign-agent/', assign_agent_to_request, name='assign_agent_to_request'),
    path('api/available-agents/', available_agents, name='available_agents'),
    # Agent Dashboard URLs
    path('api/agent/assigned-tasks/', agent_assigned_tasks, name='agent_assigned_tasks'),
    path('api/agent/dashboard-stats/', agent_dashboard_stats, name='agent_dashboard_stats'),
    path('api/agent/tasks/<int:task_id>/update-status/', agent_update_task_status, name='agent_update_task_status'),
    # Payment URLs
    path('api/payment/<int:payment_id>/update-status/', update_payment_status, name='update_payment_status'),
]
