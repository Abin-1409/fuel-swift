'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ServiceManagement() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newService, setNewService] = useState({
    type: '',
    description: '',
    stock: 0,
    unit: '',
    price: 0,
    status: 'active',
    currency: 'INR'
  });

  const API_BASE_URL = 'http://localhost:8000';

  // Get service name from type
  const getServiceName = (type) => {
    const names = {
      petrol: 'Petrol Service',
      diesel: 'Diesel Service',
      ev: 'EV Charging',
      air: 'Air Filling',
      mechanical: 'Mechanical Work'
    };
    return names[type] || 'Service';
  };

  // Get unit from type
  const getUnitFromType = (type) => {
    const units = {
      petrol: 'liters',
      diesel: 'liters',
      ev: 'stations',
      air: 'pumps',
      mechanical: 'mechanics'
    };
    return units[type] || '';
  };

  // Get stock label based on service type
  const getStockLabel = (type) => {
    const labels = {
      petrol: 'Stock',
      diesel: 'Stock',
      ev: null,
      air: null,
      mechanical: null
    };
    return labels[type] || 'Stock';
  };

  // Get price label based on service type
  const getPriceLabel = (type) => {
    const labels = {
      petrol: 'Price per Liter',
      diesel: 'Price per Liter',
      ev: 'Price per Session',
      air: 'Price per Service',
      mechanical: 'Price per Hour'
    };
    return labels[type] || 'Price';
  };

  // Get default description based on type
  const getDefaultDescription = (type) => {
    const descriptions = {
      petrol: 'Premium petrol delivery service with quality assurance',
      diesel: 'Bulk diesel delivery service for commercial vehicles',
      ev: 'Mobile electric vehicle charging with fast charging capability',
      air: 'Professional tire inflation service with leak detection',
      mechanical: 'On-site vehicle repair and maintenance by expert mechanics'
    };
    return descriptions[type] || 'Professional roadside assistance service';
  };

  // Get default stock based on type
  const getDefaultStock = (type) => {
    const defaults = {
      petrol: 1000,
      diesel: 1000,
      ev: null,
      air: null,
      mechanical: null
    };
    return defaults[type] || 0;
  };

  // Get default price based on type
  const getDefaultPrice = (type) => {
    const defaults = {
      petrol: 96.50,
      diesel: 89.20,
      ev: 150.00,
      air: 50.00,
      mechanical: 500.00
    };
    return defaults[type] || 0;
  };

  // Check if service type needs stock field
  const needsStockField = (type) => {
    return type === 'petrol' || type === 'diesel';
  };

  // Fetch services from API
  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/services/`);
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      const data = await response.json();
      setServices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleEdit = (service) => {
    setEditingService(service);
  };

  const handleSave = async (updatedService) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/services/${updatedService.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedService),
      });

      if (!response.ok) {
        throw new Error('Failed to update service');
      }

      const updatedData = await response.json();
      setServices(services.map(s => s.id === updatedService.id ? updatedData : s));
      setEditingService(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAdd = async () => {
    try {
      const serviceData = {
        ...newService,
        name: getServiceName(newService.type),
        unit: getUnitFromType(newService.type),
        description: newService.description || getDefaultDescription(newService.type),
        stock: needsStockField(newService.type) ? (newService.stock || getDefaultStock(newService.type)) : 0,
        price: newService.price || getDefaultPrice(newService.type)
      };

      const response = await fetch(`${API_BASE_URL}/api/services/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        throw new Error('Failed to create service');
      }

      const createdService = await response.json();
      setServices([...services, createdService]);
      setNewService({
        type: '',
        description: '',
        stock: 0,
        unit: '',
        price: 0,
        status: 'active',
        currency: 'INR'
      });
      setShowAddForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/services/${id}/`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete service');
        }

        setServices(services.filter(s => s.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const getIconForType = (type) => {
    const icons = {
      petrol: '⛽',
      diesel: '⛽',
      ev: '🔌',
      air: '💨',
      mechanical: '🔧'
    };
    return icons[type] || '⚙️';
  };

  const getColorForType = (type) => {
    const colors = {
      petrol: 'from-blue-500 to-blue-600',
      diesel: 'from-green-500 to-green-600',
      ev: 'from-purple-500 to-purple-600',
      air: 'from-orange-500 to-orange-600',
      mechanical: 'from-red-500 to-red-600'
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const getFeaturesForType = (type) => {
    const features = {
      petrol: ['24/7 Delivery', 'Quality Assured', 'Quick Service'],
      diesel: ['Bulk Delivery', 'Quality Check', 'Fast Response'],
      ev: ['Fast Charging', 'Multiple Ports', 'Smart Monitoring'],
      air: ['Precision Filling', 'Leak Detection', '24/7 Service'],
      mechanical: ['Expert Mechanics', 'Quick Response', 'Quality Parts']
    };
    return features[type] || ['Professional Service', 'Quality Assured'];
  };

  // Handle type change to auto-fill defaults
  const handleTypeChange = (type) => {
    setNewService({
      ...newService,
      type: type,
      description: getDefaultDescription(type),
      stock: needsStockField(type) ? getDefaultStock(type) : 0,
      price: getDefaultPrice(type),
      unit: getUnitFromType(type)
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading services...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Service Management</h1>
            <p className="text-gray-400">Manage all roadside assistance services</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
          >
            + Add New Service
          </button>
        </div>

        {/* Add Service Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-gray-700 mb-8"
          >
            <h2 className="text-xl font-bold text-white mb-6">Add New Service</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <select
                value={newService.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
              >
                <option value="">Select Service Type</option>
                <option value="petrol">Petrol Service</option>
                <option value="diesel">Diesel Service</option>
                <option value="ev">EV Charging</option>
                <option value="air">Air Filling</option>
                <option value="mechanical">Mechanical Work</option>
              </select>
              <input
                type="text"
                placeholder="Description"
                value={newService.description}
                onChange={(e) => setNewService({...newService, description: e.target.value})}
                className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
              />
              {needsStockField(newService.type) && (
                <input
                  type="number"
                  placeholder="Stock"
                  value={newService.stock}
                  onChange={(e) => setNewService({...newService, stock: parseInt(e.target.value)})}
                  className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                />
              )}
              <input
                type="number"
                step="0.01"
                placeholder={getPriceLabel(newService.type) || "Price (₹)"}
                value={newService.price}
                onChange={(e) => setNewService({...newService, price: parseFloat(e.target.value)})}
                className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
              />
              <select
                value={newService.status}
                onChange={(e) => setNewService({...newService, status: e.target.value})}
                className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleAdd}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                Add Service
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-gray-700"
            >
              {editingService?.id === service.id ? (
                <ServiceEditForm
                  service={editingService}
                  onSave={handleSave}
                  onCancel={() => setEditingService(null)}
                  getStockLabel={getStockLabel}
                  getPriceLabel={getPriceLabel}
                  needsStockField={needsStockField}
                />
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getColorForType(service.type)} flex items-center justify-center text-2xl`}>
                        {getIconForType(service.type)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{service.name}</h3>
                        <p className="text-gray-400 text-sm">{service.description}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      service.status === 'active' ? 'bg-green-500/20 text-green-300' :
                      service.status === 'inactive' ? 'bg-red-500/20 text-red-300' :
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {service.status}
                    </span>
                  </div>

                  <div className={`grid gap-4 mb-4 ${needsStockField(service.type) ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {needsStockField(service.type) && (
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <p className="text-gray-400 text-sm">{getStockLabel(service.type)}</p>
                        <p className="text-white font-bold">{service.stock} {service.unit}</p>
                      </div>
                    )}
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-gray-400 text-sm">{getPriceLabel(service.type)}</p>
                      <p className="text-white font-bold">₹{service.price} {service.currency}</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-gray-400 text-sm">Type</p>
                      <p className="text-white font-bold capitalize">{service.type}</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-gray-400 text-sm">Created</p>
                      <p className="text-white font-bold text-sm">{new Date(service.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {services.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No services found. Add your first service to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ServiceEditForm({ service, onSave, onCancel, getStockLabel, getPriceLabel, needsStockField }) {
  const [editedService, setEditedService] = useState(service);

  const handleSave = () => {
    onSave(editedService);
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-white mb-4">Edit Service</h3>
      <div className={`grid gap-4 mb-4 ${needsStockField(editedService.type) ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <input
          type="text"
          value={editedService.name}
          onChange={(e) => setEditedService({...editedService, name: e.target.value})}
          className="p-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
        />
        {needsStockField(editedService.type) && (
          <input
            type="number"
            placeholder={getStockLabel(editedService.type)}
            value={editedService.stock}
            onChange={(e) => setEditedService({...editedService, stock: parseInt(e.target.value)})}
            className="p-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          />
        )}
        <input
          type="number"
          step="0.01"
          placeholder={getPriceLabel(editedService.type)}
          value={editedService.price}
          onChange={(e) => setEditedService({...editedService, price: parseFloat(e.target.value)})}
          className="p-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
        />
        <select
          value={editedService.status}
          onChange={(e) => setEditedService({...editedService, status: e.target.value})}
          className="p-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
