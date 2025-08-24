export const dummyHandovers = [
  {
    id: '1',
    title: 'MQ upgradation',
    fromShift: {
      id: '3',
      name: 'Night Shift',
      time: '22:00 - 06:00'
    },
    toShift: {
      id: '1',
      name: 'Morning Shift',
      time: '06:00 - 14:00'
    },
    createdBy: {
      id: 'user2',
      name: 'Aryan Purohit'
    },
    createdAt: '2025-08-04T22:30:00Z',
    tasks: [
      {
        title: 'ACE Upgradation',
        description: 'ACE 12 to ACE 13',
        priority: 'high',
        status: 'completed',
        createdAt: '2025-08-04T22:30:00Z',
        lastUpdated: '2025-08-04T23:15:00Z'
      },
      {
        title: 'ds agent status check',
        description: 'Check running status of DS agent',
        priority: 'critical',
        status: 'in-progress',
        createdAt: '2025-08-04T22:30:00Z',
        lastUpdated: '2025-08-04T23:30:00Z'
      },
      {
        title: 'Update System Log',
        description: 'Document all maintenance activities in the system',
        priority: 'medium',
        status: 'pending',
        createdAt: '2025-08-04T22:30:00Z'
      }
    ],
    attachments: []
  },
  {
    id: '2',
    title: 'Server Inventory Update',
    fromShift: {
      id: '1',
      name: 'Morning Shift',
      time: '06:00 - 14:00'
    },
    toShift: {
      id: '2',
      name: 'Afternoon Shift',
      time: '14:00 - 22:00'
    },
    createdBy: {
      id: 'user1',
      name: 'Avinash Chaurasia'
    },
    createdAt: '2025-08-04T13:45:00Z',
    tasks: [
      {
        title: 'Update Inventory System',
        description: 'Record 50 new units in the inventory management system',
        priority: 'high',
        status: 'completed',
        createdAt: '2025-08-04T13:45:00Z',
        lastUpdated: '2025-08-04T14:30:00Z'
      },
      {
        title: 'Perform Physical Count',
        description: 'Verify inventory matches system count',
        priority: 'medium',
        status: 'pending',
        createdAt: '2025-08-04T13:45:00Z'
      },
      {
        title: 'File Delivery Documentation',
        description: 'Scan and upload all delivery receipts and documents',
        priority: 'low',
        status: 'pending',
        createdAt: '2025-08-04T13:45:00Z'
      }
    ],
    attachments: [
      { name: 'inventory_list.pdf', type: 'pdf' },
      { name: 'delivery_photo.jpg', type: 'image' }
    ]
  },
  {
    id: '3',
    title: 'Server Inspection',
    fromShift: {
      id: '2',
      name: 'Afternoon Shift',
      time: '14:00 - 22:00'
    },
    toShift: {
      id: '3',
      name: 'Night Shift',
      time: '22:00 - 06:00'
    },
    createdBy: {
      id: 'user3',
      name: 'Affan MD'
    },
    createdAt: '2025-08-04T21:15:00Z',
    tasks: [
      {
        title: 'Server Inspection',
        description: 'Inspect all server equipment and emergency response',
        priority: 'critical',
        status: 'completed',
        createdAt: '2025-08-04T21:15:00Z',
        lastUpdated: '2025-08-04T21:45:00Z'
      },
      {
        title: 'Disaster Recovery System Check',
        description: 'Test Disaster Recovery systems and document findings',
        priority: 'high',
        status: 'completed',
        createdAt: '2025-08-04T21:15:00Z',
        lastUpdated: '2025-08-04T22:00:00Z'
      },
      {
        title: 'System Maintenance',
        description: 'Verify all systems are properly marked and functional',
        priority: 'high',
        status: 'completed',
        createdAt: '2025-08-04T21:15:00Z',
        lastUpdated: '2025-08-04T22:15:00Z'
      },
      {
        title: 'Issue Documentation',
        description: 'Document and tag two identified safety issues for repair',
        priority: 'medium',
        status: 'in-progress',
        createdAt: '2025-08-04T21:15:00Z'
      }
    ],
    attachments: [
      { name: 'inspection_report.pdf', type: 'pdf' },
      { name: 'issue_1.jpg', type: 'image' },
      { name: 'issue_2.jpg', type: 'image' }
    ]
  }
];