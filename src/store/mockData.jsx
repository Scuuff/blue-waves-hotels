export const mockUsers = [
  { 
    id: '1', 
    firstName: 'John', 
    lastName: 'Smith', 
    email: 'john.smith@email.com', 
    phone: '+1 234 567 8901', 
    role: 'customer', 
    status: 'active', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', 
    joinedDate: 'Jan 15, 2024', 
    lastLogin: 'Mar 14, 2026',
    address: '123 Main St, New York', // Matches the subtext in your table UI
    city: 'New York',
    country: 'USA'
  },
  { id: '2', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@email.com', phone: '+1 234 567 8902', role: 'customer', status: 'active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', joinedDate: 'Feb 20, 2024', lastLogin: 'Mar 13, 2026', address: '123 Main St, New York', city: 'New York', country: 'USA' },
  { id: '3', firstName: 'Michael', lastName: 'Brown', email: 'michael.b@email.com', phone: '+1 234 567 8903', role: 'customer', status: 'blocked', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael', joinedDate: 'Mar 10, 2024', lastLogin: 'Mar 10, 2026', address: '123 Main St, New York', city: 'New York', country: 'USA' },
  { id: '4', firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@email.com', phone: '+1 234 567 8904', role: 'customer', status: 'active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', joinedDate: 'Apr 5, 2024', lastLogin: 'Mar 14, 2026', address: '123 Main St, New York', city: 'New York', country: 'USA' },
  { id: '5', firstName: 'David', lastName: 'Wilson', email: 'david.w@email.com', phone: '+1 234 567 8905', role: 'staff', status: 'active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', joinedDate: 'Jan 8, 2024', lastLogin: 'Mar 14, 2026', address: '123 Main St, New York', city: 'New York', country: 'USA' },
  { id: '6', firstName: 'Jessica', lastName: 'Taylor', email: 'jessica.t@email.com', phone: '+1 234 567 8906', role: 'customer', status: 'active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica', joinedDate: 'May 12, 2024', lastLogin: 'Mar 12, 2026', address: '123 Main St, New York', city: 'New York', country: 'USA' },
  { id: '7', firstName: 'Robert', lastName: 'Anderson', email: 'robert.a@email.com', phone: '+1 234 567 8907', role: 'customer', status: 'blocked', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert', joinedDate: 'Jun 18, 2024', lastLogin: 'Mar 8, 2026', address: '123 Main St, New York', city: 'New York', country: 'USA' },
  { id: '8', firstName: 'Amanda', lastName: 'Martinez', email: 'amanda.m@email.com', phone: '+1 234 567 8908', role: 'customer', status: 'active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda', joinedDate: 'Jul 22, 2024', lastLogin: 'Mar 14, 2026', address: '123 Main St, New York', city: 'New York', country: 'USA' }
];

export const mockUserActivities = [
  {
    id: 1,
    userId: '1', 
    action: "booking_created",
    description: 'Booked "Royal Suite Escape" for 2 nights',
    timestamp: "2026-03-18T12:30:00Z"
  },
  {
    id: 2,
    userId: '1',
    action: "login",
    description: "User logged into the system",
    timestamp: "2026-03-19T07:15:00Z"
  },
  {
    id: 3,
    userId: '5',
    action: "status_changed",
    description: "Blocked account for Michael Brown",
    timestamp: "2026-03-19T09:00:00Z"
  }
];