import { apiClient } from './apiClient';

export const getAvailablePlans = async (params) => {
  try {
    const { data } = await apiClient.get('/plans/available', { params });
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to fetch plans' };
  }
};

export const subscribeToPlan = async (payload) => {
  try {
    const { data } = await apiClient.post('/plans/subscribe', payload);
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Subscription failed' };
  }
};

export const createRazorpayOrder = async (payload) => {
  try {
    const { data } = await apiClient.post('/plans/create-order', payload);
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Order creation failed' };
  }
};

export const verifyRazorpayPayment = async (payload) => {
  try {
    const { data } = await apiClient.post('/plans/verify-payment', payload);
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Payment verification failed' };
  }
};
