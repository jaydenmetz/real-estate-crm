/**
 * Event handler utilities for Escrow Details page
 *
 * Extracted from index.jsx to keep main component clean
 */

/**
 * Handle reminder toggle
 * @param {string|number} id - Reminder ID
 * @param {Array} reminders - Current reminders array
 * @param {Function} setReminders - State setter
 */
export const handleReminderToggle = (id, reminders, setReminders) => {
  setReminders(reminders.map(r =>
    r.id === id ? { ...r, completed: !r.completed } : r
  ));
};

/**
 * Handle adding new reminder
 * @param {string} text - Reminder text
 * @param {Array} reminders - Current reminders array
 * @param {Function} setReminders - State setter
 */
export const handleAddReminder = (text, reminders, setReminders) => {
  setReminders([...reminders, { id: Date.now(), text, completed: false }]);
};

/**
 * Handle deleting reminder
 * @param {string|number} id - Reminder ID
 * @param {Array} reminders - Current reminders array
 * @param {Function} setReminders - State setter
 */
export const handleDeleteReminder = (id, reminders, setReminders) => {
  setReminders(reminders.filter(r => r.id !== id));
};

/**
 * Handle automation toggle
 * @param {string} key - Automation key
 * @param {Object} automations - Current automations object
 * @param {Function} setAutomations - State setter
 */
export const handleToggleAutomation = (key, automations, setAutomations) => {
  setAutomations({ ...automations, [key]: !automations[key] });
};

/**
 * Handle quick actions
 * @param {string} action - Action type
 */
export const handleQuickAction = (action) => {
  console.log('Quick action:', action);
  // TODO: Implement actual quick actions
};

/**
 * Check if user is admin
 * @returns {boolean} True if user is admin or system_admin
 */
export const checkIsAdmin = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    const user = JSON.parse(userStr);
    return user && (user.role === 'admin' || user.role === 'system_admin');
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};
