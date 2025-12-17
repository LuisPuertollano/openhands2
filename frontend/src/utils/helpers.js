export const getCapacityColor = (utilizationPercentage) => {
  if (utilizationPercentage > 100) return '#ff4444';
  if (utilizationPercentage >= 90) return '#ff9800';
  if (utilizationPercentage >= 70) return '#ffeb3b';
  if (utilizationPercentage >= 40) return '#8bc34a';
  return '#4caf50';
};

export const getCapacityStatusText = (utilizationPercentage) => {
  if (utilizationPercentage > 100) return 'Over Capacity';
  if (utilizationPercentage >= 90) return 'At Capacity';
  if (utilizationPercentage >= 70) return 'High';
  if (utilizationPercentage >= 40) return 'Moderate';
  return 'Low';
};

export const getBudgetColor = (status) => {
  const colors = {
    OVER_BUDGET: '#ff4444',
    AT_BUDGET: '#ff9800',
    UNDER_BUDGET: '#4caf50',
  };
  return colors[status] || '#999';
};

export const formatHours = (hours) => {
  return parseFloat(hours).toFixed(1);
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const getCurrentYearMonth = () => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
};
