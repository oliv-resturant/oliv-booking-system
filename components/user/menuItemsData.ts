export interface MenuItemVariant {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  pricingType?: 'per_person' | 'flat_fee' | 'billed_by_consumption';
  image: string;
  allergens?: string[];
  addOns?: { id: string; name: string; price: number }[];
  variants?: MenuItemVariant[];
  dietaryType: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'none';
}

export const menuItems: MenuItem[] = [
  // Appetizers
  { 
    id: '1', 
    name: 'Salmon Crostini with Dill Cream', 
    description: 'House-cured salmon on crispy bread with dill lemon cream', 
    category: 'Appetizers', 
    price: 9,
    image: 'https://images.unsplash.com/photo-1739785938237-73b3654200d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Fish', 'Gluten', 'Dairy'],
    addOns: [
      { id: 'ao1', name: 'Extra Dill Cream', price: 2 },
      { id: 'ao2', name: 'Capers', price: 1.5 }
    ],
    dietaryType: 'non-vegetarian'
  },
  { 
    id: '2', 
    name: 'Caprese Skewers', 
    description: 'Mozzarella, cherry tomatoes and basil with balsamic glaze', 
    category: 'Appetizers', 
    price: 8,
    image: 'https://images.unsplash.com/photo-1665877417637-a20691d6ee8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Dairy'],
    addOns: [
      { id: 'ao3', name: 'Extra Balsamic Glaze', price: 1 },
      { id: 'ao4', name: 'Pesto Drizzle', price: 2 }
    ],
    dietaryType: 'vegetarian'
  },
  { 
    id: '3', 
    name: 'Mini Quiches', 
    description: 'Various flavors: Spinach-Feta, Bacon-Onion, Mushroom-Cheese', 
    category: 'Appetizers', 
    price: 7,
    image: 'https://images.unsplash.com/photo-1614778168922-ab1cdf04800e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Eggs', 'Dairy', 'Gluten'],
    addOns: [
      { id: 'ao5', name: 'Sour Cream', price: 1.5 }
    ],
    dietaryType: 'non-vegetarian'
  },
  { 
    id: '4', 
    name: 'Bruschetta Variations', 
    description: 'Classic with tomatoes, with mushrooms and with goat cheese', 
    category: 'Appetizers', 
    price: 6,
    image: 'https://images.unsplash.com/photo-1689693138625-ed8552aaefc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Gluten', 'Dairy'],
    addOns: [
      { id: 'ao6', name: 'Garlic Oil', price: 1 }
    ],
    dietaryType: 'vegetarian'
  },
  
  // Salads
  { 
    id: '5', 
    name: 'Caesar Salad', 
    description: 'Romaine lettuce with parmesan, croutons and Caesar dressing', 
    category: 'Salads', 
    price: 12,
    image: 'https://images.unsplash.com/photo-1746211224437-8340316b288d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Dairy', 'Gluten', 'Eggs'],
    addOns: [
      { id: 'ao7', name: 'Grilled Chicken', price: 4 },
      { id: 'ao8', name: 'Anchovies', price: 2 }
    ],
    variants: [
      { id: 'v7', name: 'Small', price: 12, description: 'Side portion' },
      { id: 'v8', name: 'Large', price: 18, description: 'Main course portion' }
    ],
    dietaryType: 'non-vegetarian'
  },
  { 
    id: '6', 
    name: 'Mediterranean Salad', 
    description: 'Mixed greens with feta, olives, tomatoes and balsamic vinaigrette', 
    category: 'Salads', 
    price: 11,
    image: 'https://images.unsplash.com/photo-1764397514690-82da4d4c40ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Dairy'],
    addOns: [
      { id: 'ao9', name: 'Avocado', price: 3 }
    ],
    dietaryType: 'vegetarian'
  },
  { 
    id: '7', 
    name: 'Quinoa Bowl', 
    description: 'Quinoa with roasted vegetables, avocado and tahini dressing', 
    category: 'Salads', 
    price: 13,
    image: 'https://images.unsplash.com/photo-1719677775416-1dd6a93f1a73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Sesame'],
    addOns: [
      { id: 'ao10', name: 'Hummus', price: 2 }
    ],
    dietaryType: 'vegetarian'
  },
  
  // Soups
  { 
    id: '8', 
    name: 'Tomato Basil Soup', 
    description: 'Creamy tomato soup with fresh basil', 
    category: 'Soups', 
    price: 8,
    image: 'https://images.unsplash.com/photo-1695960682129-d35477676196?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Dairy'],
    addOns: [
      { id: 'ao11', name: 'Bread Roll', price: 1.5 }
    ],
    variants: [
      { id: 'v3', name: 'Cup', price: 8, description: '250ml' },
      { id: 'v4', name: 'Bowl', price: 12, description: '400ml' }
    ],
    dietaryType: 'vegetarian'
  },
  { 
    id: '9', 
    name: 'Mushroom Soup', 
    description: 'Wild mushroom soup with truffle oil', 
    category: 'Soups', 
    price: 9,
    image: 'https://images.unsplash.com/photo-1624968814155-236efede1cec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Dairy'],
    addOns: [
      { id: 'ao12', name: 'Extra Truffle Oil', price: 3 }
    ],
    dietaryType: 'vegetarian'
  },
  
  // Pasta
  { 
    id: '10', 
    name: 'Pasta Carbonara', 
    description: 'Classic carbonara with pancetta and parmesan', 
    category: 'Pasta', 
    price: 16,
    image: 'https://images.unsplash.com/photo-1608756687911-aa1599ab3bd9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    addOns: [
      { id: 'ao13', name: 'Extra Parmesan', price: 2 }
    ],
    dietaryType: 'non-vegetarian'
  },
  { 
    id: '11', 
    name: 'Penne Arrabbiata', 
    description: 'Penne in spicy tomato sauce', 
    category: 'Pasta', 
    price: 14,
    image: 'https://images.unsplash.com/photo-1728309375543-c5906f8dbf60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Gluten'],
    addOns: [
      { id: 'ao14', name: 'Burrata', price: 4 }
    ],
    dietaryType: 'vegetarian'
  },
  { 
    id: '12', 
    name: 'Truffle Risotto', 
    description: 'Creamy risotto with truffle oil and parmesan', 
    category: 'Pasta', 
    price: 18,
    image: 'https://images.unsplash.com/photo-1740362867228-aae3d791a35e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Dairy'],
    addOns: [
      { id: 'ao15', name: 'Shaved Truffles', price: 8 }
    ],
    dietaryType: 'vegetarian'
  },
  
  // Mains
  { 
    id: '13', 
    name: 'Grilled Salmon', 
    description: 'Fresh salmon with lemon butter sauce', 
    category: 'Mains', 
    price: 24,
    image: 'https://images.unsplash.com/photo-1614627293113-e7e68163d958?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Fish', 'Dairy'],
    addOns: [
      { id: 'ao16', name: 'Asparagus', price: 4 },
      { id: 'ao17', name: 'Garlic Potatoes', price: 3 }
    ],
    variants: [
      { id: 'v1', name: 'Regular Portion', price: 24, description: '200g fillet' },
      { id: 'v2', name: 'Large Portion', price: 32, description: '300g fillet' }
    ],
    dietaryType: 'non-vegetarian'
  },
  { 
    id: '14', 
    name: 'Beef Tenderloin', 
    description: 'Premium beef with red wine reduction', 
    category: 'Mains', 
    price: 28,
    image: 'https://images.unsplash.com/photo-1666013942642-b7b54ecafd7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: [],
    addOns: [
      { id: 'ao18', name: 'Peppercorn Sauce', price: 3 },
      { id: 'ao19', name: 'Truffle Fries', price: 5 }
    ],
    dietaryType: 'non-vegetarian'
  },
  { 
    id: '15', 
    name: 'Chicken Breast', 
    description: 'Herb-crusted chicken with seasonal vegetables', 
    category: 'Mains', 
    price: 22,
    image: 'https://images.unsplash.com/photo-1595977233209-aadbe21490b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: [],
    addOns: [
      { id: 'ao20', name: 'Mushroom Sauce', price: 3 }
    ],
    dietaryType: 'non-vegetarian'
  },
  { 
    id: '16', 
    name: 'Vegetable Risotto', 
    description: 'Creamy arborio rice with seasonal vegetables', 
    category: 'Mains', 
    price: 19,
    image: 'https://images.unsplash.com/photo-1664717698774-84f62382613b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Dairy'],
    addOns: [
      { id: 'ao21', name: 'Grilled Vegetables', price: 3 }
    ],
    dietaryType: 'vegetarian'
  },
  
  // Seafood
  { 
    id: '17', 
    name: 'Grilled Prawns', 
    description: 'Jumbo prawns with garlic butter', 
    category: 'Seafood', 
    price: 26,
    image: 'https://images.unsplash.com/photo-1758972572427-fc3d4193bbd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Shellfish', 'Dairy'],
    addOns: [
      { id: 'ao22', name: 'Lemon Wedges', price: 1 }
    ],
    dietaryType: 'non-vegetarian'
  },
  { 
    id: '18', 
    name: 'Sea Bass', 
    description: 'Pan-seared sea bass with lemon caper sauce', 
    category: 'Seafood', 
    price: 27,
    image: 'https://images.unsplash.com/photo-1674574752509-1754d8098241?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Fish'],
    addOns: [
      { id: 'ao23', name: 'Sautéed Spinach', price: 3 }
    ],
    dietaryType: 'non-vegetarian'
  },
  
  // Cheese
  { 
    id: '19', 
    name: 'Cheese Platter', 
    description: 'Selection of Swiss and international cheeses', 
    category: 'Cheese', 
    price: 15,
    image: 'https://images.unsplash.com/photo-1637179440419-6d3f8e7f373f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Dairy'],
    addOns: [
      { id: 'ao24', name: 'Honey', price: 2 },
      { id: 'ao25', name: 'Crackers', price: 2 }
    ],
    dietaryType: 'vegetarian'
  },
  { 
    id: '20', 
    name: 'Fondue', 
    description: 'Traditional Swiss cheese fondue', 
    category: 'Cheese', 
    price: 22,
    image: 'https://images.unsplash.com/photo-1736752346246-61f4daedfde0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Dairy', 'Gluten'],
    addOns: [
      { id: 'ao26', name: 'Extra Bread Cubes', price: 2 }
    ],
    dietaryType: 'vegetarian'
  },
  
  // Desserts
  { 
    id: '21', 
    name: 'Tiramisu', 
    description: 'Classic Italian coffee-flavored dessert', 
    category: 'Desserts', 
    price: 8,
    image: 'https://images.unsplash.com/photo-1710106519622-8c49d0bcff2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Eggs', 'Dairy', 'Gluten'],
    addOns: [
      { id: 'ao27', name: 'Extra Cocoa', price: 0.5 }
    ],
    dietaryType: 'vegetarian'
  },
  { 
    id: '22', 
    name: 'Chocolate Lava Cake', 
    description: 'Warm chocolate cake with molten center', 
    category: 'Desserts', 
    price: 9,
    image: 'https://images.unsplash.com/photo-1673551490812-eaee2e9bf0ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Eggs', 'Dairy', 'Gluten'],
    addOns: [
      { id: 'ao28', name: 'Vanilla Ice Cream', price: 2 },
      { id: 'ao29', name: 'Whipped Cream', price: 1.5 }
    ],
    variants: [
      { id: 'v5', name: 'Individual', price: 9, description: 'Single serving' },
      { id: 'v6', name: 'Double', price: 15, description: 'Two cakes to share' }
    ],
    dietaryType: 'vegetarian'
  },
  { 
    id: '23', 
    name: 'Panna Cotta', 
    description: 'Italian cream dessert with berry compote', 
    category: 'Desserts', 
    price: 7,
    image: 'https://images.unsplash.com/photo-1542116021-0ff087fb0a41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Dairy'],
    addOns: [
      { id: 'ao30', name: 'Extra Berry Compote', price: 2 }
    ],
    dietaryType: 'vegetarian'
  },
  { 
    id: '24', 
    name: 'Fruit Tart', 
    description: 'Fresh seasonal fruits on pastry cream', 
    category: 'Desserts', 
    price: 8,
    image: 'https://images.unsplash.com/photo-1634749845406-d3418f6a54e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    addOns: [
      { id: 'ao31', name: 'Custard Sauce', price: 1.5 }
    ],
    dietaryType: 'vegetarian'
  },
];

export const categories = ['Appetizers', 'Salads', 'Soups', 'Pasta', 'Mains', 'Seafood', 'Cheese', 'Desserts'];