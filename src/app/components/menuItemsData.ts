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
  image: string;
  allergens?: string[];
  addOns?: { id: string; name: string; price: number }[];
  variants?: MenuItemVariant[];
  dietaryType: 'vegetarian' | 'non-vegetarian' | 'vegan';
  pricingType: 'per-person' | 'flat-rate';
}

export const menuItems: MenuItem[] = [
  // Apéro
  { 
    id: 'ap1', 
    name: 'Prosecco Welcome Drink', 
    description: 'Chilled Prosecco served upon arrival', 
    category: 'Apéro', 
    price: 8,
    image: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Sulfites'],
    dietaryType: 'vegan',
    pricingType: 'per-person'
  },
  { 
    id: 'ap2', 
    name: 'Champagne Reception', 
    description: 'Premium champagne with mixed nuts', 
    category: 'Apéro', 
    price: 15,
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Nuts', 'Sulfites'],
    dietaryType: 'vegan',
    pricingType: 'per-person'
  },
  { 
    id: 'ap3', 
    name: 'Signature Cocktail', 
    description: 'House-crafted signature cocktail', 
    category: 'Apéro', 
    price: 12,
    image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: [],
    dietaryType: 'vegan',
    pricingType: 'per-person'
  },

  // Starters
  { 
    id: '1', 
    name: 'Salmon Crostini with Dill Cream', 
    description: 'House-cured salmon on crispy bread with dill lemon cream', 
    category: 'Starters', 
    price: 9,
    image: 'https://images.unsplash.com/photo-1739785938237-73b3654200d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Fish', 'Gluten', 'Dairy'],
    addOns: [
      { id: 'ao1', name: 'Extra Dill Cream', price: 2 },
      { id: 'ao2', name: 'Capers', price: 1.5 }
    ],
    dietaryType: 'non-vegetarian',
    pricingType: 'per-person'
  },
  { 
    id: '2', 
    name: 'Caprese Skewers', 
    description: 'Mozzarella, cherry tomatoes and basil with balsamic glaze', 
    category: 'Starters', 
    price: 8,
    image: 'https://images.unsplash.com/photo-1665877417637-a20691d6ee8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Dairy'],
    addOns: [
      { id: 'ao3', name: 'Extra Balsamic Glaze', price: 1 },
      { id: 'ao4', name: 'Pesto Drizzle', price: 2 }
    ],
    dietaryType: 'vegetarian',
    pricingType: 'per-person'
  },
  { 
    id: '3', 
    name: 'Mini Quiches', 
    description: 'Various flavors: Spinach-Feta, Bacon-Onion, Mushroom-Cheese', 
    category: 'Starters', 
    price: 7,
    image: 'https://images.unsplash.com/photo-1614778168922-ab1cdf04800e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Eggs', 'Dairy', 'Gluten'],
    addOns: [
      { id: 'ao5', name: 'Sour Cream', price: 1.5 }
    ],
    dietaryType: 'non-vegetarian',
    pricingType: 'per-person'
  },
  { 
    id: '4', 
    name: 'Bruschetta Variations', 
    description: 'Classic with tomatoes, with mushrooms and with goat cheese', 
    category: 'Starters', 
    price: 6,
    image: 'https://images.unsplash.com/photo-1689693138625-ed8552aaefc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Gluten', 'Dairy'],
    addOns: [
      { id: 'ao6', name: 'Garlic Oil', price: 1 }
    ],
    dietaryType: 'vegetarian',
    pricingType: 'per-person'
  },
  { 
    id: '5', 
    name: 'Caesar Salad', 
    description: 'Romaine lettuce with parmesan, croutons and Caesar dressing', 
    category: 'Starters', 
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
    dietaryType: 'non-vegetarian',
    pricingType: 'per-person'
  },
  { 
    id: '6', 
    name: 'Mediterranean Salad', 
    description: 'Mixed greens with feta, olives, tomatoes and balsamic vinaigrette', 
    category: 'Starters', 
    price: 11,
    image: 'https://images.unsplash.com/photo-1764397514690-82da4d4c40ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Dairy'],
    addOns: [
      { id: 'ao9', name: 'Avocado', price: 3 }
    ],
    dietaryType: 'vegetarian',
    pricingType: 'per-person'
  },
  { 
    id: '7', 
    name: 'Quinoa Bowl', 
    description: 'Quinoa with roasted vegetables, avocado and tahini dressing', 
    category: 'Starters', 
    price: 13,
    image: 'https://images.unsplash.com/photo-1719677775416-1dd6a93f1a73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Sesame'],
    addOns: [
      { id: 'ao10', name: 'Hummus', price: 2 }
    ],
    dietaryType: 'vegetarian',
    pricingType: 'per-person'
  },
  { 
    id: '8', 
    name: 'Tomato Basil Soup', 
    description: 'Creamy tomato soup with fresh basil', 
    category: 'Starters', 
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
    dietaryType: 'vegetarian',
    pricingType: 'per-person'
  },
  { 
    id: '9', 
    name: 'Mushroom Soup', 
    description: 'Wild mushroom soup with truffle oil', 
    category: 'Starters', 
    price: 9,
    image: 'https://images.unsplash.com/photo-1624968814155-236efede1cec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Dairy'],
    addOns: [
      { id: 'ao12', name: 'Extra Truffle Oil', price: 3 }
    ],
    dietaryType: 'vegetarian',
    pricingType: 'per-person'
  },
  
  // Intermediate Course
  { 
    id: '10', 
    name: 'Pasta Carbonara', 
    description: 'Classic carbonara with pancetta and parmesan', 
    category: 'Intermediate Course', 
    price: 16,
    image: 'https://images.unsplash.com/photo-1608756687911-aa1599ab3bd9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    addOns: [
      { id: 'ao13', name: 'Extra Parmesan', price: 2 }
    ],
    dietaryType: 'non-vegetarian',
    pricingType: 'per-person'
  },
  { 
    id: '11', 
    name: 'Penne Arrabbiata', 
    description: 'Penne in spicy tomato sauce', 
    category: 'Intermediate Course', 
    price: 14,
    image: 'https://images.unsplash.com/photo-1728309375543-c5906f8dbf60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Gluten'],
    addOns: [
      { id: 'ao14', name: 'Burrata', price: 4 }
    ],
    dietaryType: 'vegetarian',
    pricingType: 'per-person'
  },
  { 
    id: '12', 
    name: 'Truffle Risotto', 
    description: 'Creamy risotto with truffle oil and parmesan', 
    category: 'Intermediate Course', 
    price: 18,
    image: 'https://images.unsplash.com/photo-1740362867228-aae3d791a35e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Dairy'],
    addOns: [
      { id: 'ao15', name: 'Shaved Truffles', price: 8 }
    ],
    dietaryType: 'vegetarian',
    pricingType: 'per-person'
  },
  { 
    id: '19', 
    name: 'Cheese Platter', 
    description: 'Selection of Swiss and international cheeses', 
    category: 'Intermediate Course', 
    price: 15,
    image: 'https://images.unsplash.com/photo-1637179440419-6d3f8e7f373f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Dairy'],
    addOns: [
      { id: 'ao24', name: 'Honey', price: 2 },
      { id: 'ao25', name: 'Crackers', price: 2 }
    ],
    dietaryType: 'vegetarian',
    pricingType: 'per-person'
  },
  { 
    id: '20', 
    name: 'Fondue', 
    description: 'Traditional Swiss cheese fondue', 
    category: 'Intermediate Course', 
    price: 22,
    image: 'https://images.unsplash.com/photo-1736752346246-61f4daedfde0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Dairy', 'Gluten'],
    addOns: [
      { id: 'ao26', name: 'Extra Bread Cubes', price: 2 }
    ],
    dietaryType: 'vegetarian',
    pricingType: 'per-person'
  },
  
  // Main Courses Meat/Fish
  { 
    id: '13', 
    name: 'Grilled Salmon', 
    description: 'Fresh salmon with lemon butter sauce', 
    category: 'Main Courses Meat/Fish', 
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
    dietaryType: 'non-vegetarian',
    pricingType: 'per-person'
  },
  { 
    id: '14', 
    name: 'Beef Tenderloin', 
    description: 'Premium beef with red wine reduction', 
    category: 'Main Courses Meat/Fish', 
    price: 28,
    image: 'https://images.unsplash.com/photo-1666013942642-b7b54ecafd7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: [],
    addOns: [
      { id: 'ao18', name: 'Peppercorn Sauce', price: 3 },
      { id: 'ao19', name: 'Truffle Fries', price: 5 }
    ],
    dietaryType: 'non-vegetarian',
    pricingType: 'per-person'
  },
  { 
    id: '15', 
    name: 'Chicken Breast', 
    description: 'Herb-crusted chicken with seasonal vegetables', 
    category: 'Main Courses Meat/Fish', 
    price: 22,
    image: 'https://images.unsplash.com/photo-1595977233209-aadbe21490b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: [],
    addOns: [
      { id: 'ao20', name: 'Mushroom Sauce', price: 3 }
    ],
    dietaryType: 'non-vegetarian',
    pricingType: 'per-person'
  },
  { 
    id: '17', 
    name: 'Grilled Prawns', 
    description: 'Jumbo prawns with garlic butter', 
    category: 'Main Courses Meat/Fish', 
    price: 26,
    image: 'https://images.unsplash.com/photo-1758972572427-fc3d4193bbd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Shellfish', 'Dairy'],
    addOns: [
      { id: 'ao22', name: 'Lemon Wedges', price: 1 }
    ],
    dietaryType: 'non-vegetarian',
    pricingType: 'per-person'
  },
  { 
    id: '18', 
    name: 'Sea Bass', 
    description: 'Pan-seared sea bass with lemon caper sauce', 
    category: 'Main Courses Meat/Fish', 
    price: 27,
    image: 'https://images.unsplash.com/photo-1674574752509-1754d8098241?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Fish'],
    addOns: [
      { id: 'ao23', name: 'Sautéed Spinach', price: 3 }
    ],
    dietaryType: 'non-vegetarian',
    pricingType: 'per-person'
  },

  // Main Courses Veggie
  { 
    id: '16', 
    name: 'Vegetable Risotto', 
    description: 'Creamy arborio rice with seasonal vegetables', 
    category: 'Main Courses Veggie', 
    price: 19,
    image: 'https://images.unsplash.com/photo-1664717698774-84f62382613b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Dairy'],
    addOns: [
      { id: 'ao21', name: 'Grilled Vegetables', price: 3 }
    ],
    dietaryType: 'vegetarian',
    pricingType: 'per-person'
  },
  { 
    id: 'mv1', 
    name: 'Mushroom Wellington', 
    description: 'Wild mushrooms wrapped in golden puff pastry', 
    category: 'Main Courses Veggie', 
    price: 21,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Gluten', 'Dairy'],
    addOns: [
      { id: 'ao32', name: 'Red Wine Sauce', price: 3 }
    ],
    dietaryType: 'vegetarian',
    pricingType: 'per-person'
  },
  { 
    id: 'mv2', 
    name: 'Eggplant Parmesan', 
    description: 'Layers of eggplant with marinara and mozzarella', 
    category: 'Main Courses Veggie', 
    price: 18,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Dairy', 'Gluten'],
    dietaryType: 'vegetarian',
    pricingType: 'per-person'
  },

  // Main Courses Vegan
  { 
    id: 'vg1', 
    name: 'Buddha Bowl', 
    description: 'Quinoa, roasted vegetables, tahini dressing', 
    category: 'Main Courses Vegan', 
    price: 17,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Sesame'],
    addOns: [
      { id: 'ao33', name: 'Avocado', price: 3 }
    ],
    dietaryType: 'vegan',
    pricingType: 'per-person'
  },
  { 
    id: 'vg2', 
    name: 'Stuffed Bell Peppers', 
    description: 'Peppers filled with rice, vegetables and herbs', 
    category: 'Main Courses Vegan', 
    price: 16,
    image: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: [],
    dietaryType: 'vegan',
    pricingType: 'per-person'
  },
  { 
    id: 'vg3', 
    name: 'Cauliflower Steak', 
    description: 'Roasted cauliflower with chimichurri sauce', 
    category: 'Main Courses Vegan', 
    price: 18,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: [],
    dietaryType: 'vegan',
    pricingType: 'per-person'
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
    dietaryType: 'vegetarian',
    pricingType: 'per-person'
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
    dietaryType: 'vegetarian',
    pricingType: 'per-person'
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
    dietaryType: 'vegetarian',
    pricingType: 'per-person'
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
    dietaryType: 'vegetarian',
    pricingType: 'per-person'
  },

  // Technology (flat-rate)
  { 
    id: 'tech1', 
    name: 'Projector & Screen', 
    description: 'HD projector with 120" screen for presentations', 
    category: 'Technology', 
    price: 250,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: [],
    dietaryType: 'non-vegetarian',
    pricingType: 'flat-rate'
  },
  { 
    id: 'tech2', 
    name: 'Sound System', 
    description: 'Professional PA system with wireless microphones', 
    category: 'Technology', 
    price: 350,
    image: 'https://images.unsplash.com/photo-1545127398-14699f92334b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: [],
    dietaryType: 'non-vegetarian',
    pricingType: 'flat-rate'
  },
  { 
    id: 'tech3', 
    name: 'LED Dance Floor', 
    description: 'Illuminated dance floor with color changing LEDs', 
    category: 'Technology', 
    price: 500,
    image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: [],
    dietaryType: 'non-vegetarian',
    pricingType: 'flat-rate'
  },

  // Decoration (flat-rate)
  { 
    id: 'deco1', 
    name: 'Floral Centerpieces', 
    description: 'Fresh seasonal flower arrangements for tables', 
    category: 'Decoration', 
    price: 450,
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: [],
    dietaryType: 'non-vegetarian',
    pricingType: 'flat-rate'
  },
  { 
    id: 'deco2', 
    name: 'String Lighting', 
    description: 'Warm white string lights for ambient atmosphere', 
    category: 'Decoration', 
    price: 200,
    image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: [],
    dietaryType: 'non-vegetarian',
    pricingType: 'flat-rate'
  },
  { 
    id: 'deco3', 
    name: 'Backdrop & Draping', 
    description: 'Elegant fabric backdrop for photo opportunities', 
    category: 'Decoration', 
    price: 350,
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: [],
    dietaryType: 'non-vegetarian',
    pricingType: 'flat-rate'
  },

  // Furniture (flat-rate)
  { 
    id: 'furn1', 
    name: 'Cocktail Tables', 
    description: 'High-top cocktail tables for standing receptions (set of 10)', 
    category: 'Furniture', 
    price: 300,
    image: 'https://images.unsplash.com/photo-1768851244529-39180171a168?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NrdGFpbCUyMHRhYmxlcyUyMGV2ZW50JTIwcmVjZXB0aW9ufGVufDF8fHx8MTc3MDcwMzYyMnww&ixlib=rb-4.1.0&q=80&w=1080',
    allergens: [],
    dietaryType: 'non-vegetarian',
    pricingType: 'flat-rate'
  },
  { 
    id: 'furn2', 
    name: 'Lounge Furniture Set', 
    description: 'Sofas, armchairs and coffee tables for lounge area', 
    category: 'Furniture', 
    price: 600,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: [],
    dietaryType: 'non-vegetarian',
    pricingType: 'flat-rate'
  },
  { 
    id: 'furn3', 
    name: 'Bar Setup', 
    description: 'Portable bar with stools and shelving', 
    category: 'Furniture', 
    price: 400,
    image: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: [],
    dietaryType: 'non-vegetarian',
    pricingType: 'flat-rate'
  },

  // Miscellaneous (flat-rate)
  { 
    id: 'misc1', 
    name: 'Event Photography', 
    description: 'Professional photographer for 4 hours with digital photos', 
    category: 'Miscellaneous', 
    price: 800,
    image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: [],
    dietaryType: 'non-vegetarian',
    pricingType: 'flat-rate'
  },
  { 
    id: 'misc2', 
    name: 'DJ Service', 
    description: 'Professional DJ with music library for 4 hours', 
    category: 'Miscellaneous', 
    price: 600,
    image: 'https://images.unsplash.com/photo-1764014520799-b6b1152d30e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: [],
    dietaryType: 'non-vegetarian',
    pricingType: 'flat-rate'
  },
  { 
    id: 'misc3', 
    name: 'Coat Check Service', 
    description: 'Attended coat check for guest convenience', 
    category: 'Miscellaneous', 
    price: 150,
    image: 'https://images.unsplash.com/photo-1603524961821-fcbbee4f0ae0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: [],
    dietaryType: 'non-vegetarian',
    pricingType: 'flat-rate'
  },
  { 
    id: 'misc4', 
    name: 'Valet Parking', 
    description: 'Valet parking service for up to 50 vehicles', 
    category: 'Miscellaneous', 
    price: 400,
    image: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: [],
    dietaryType: 'non-vegetarian',
    pricingType: 'flat-rate'
  },
  
  // Beverages - Wines and some drinks changed to flat-rate pricing (charged by bottle/quantity, not per person)
  {
    id: 'bev1',
    name: 'Premium Wine Package',
    description: 'Selection of red, white, and rosé wines from Swiss and international vineyards (charged by bottle)',
    category: 'Beverages',
    price: 45,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Sulfites'],
    dietaryType: 'vegan',
    pricingType: 'flat-rate'
  },
  {
    id: 'bev2',
    name: 'Standard Wine Package',
    description: 'House selection of red and white wines (charged by bottle)',
    category: 'Beverages',
    price: 32,
    image: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Sulfites'],
    dietaryType: 'vegan',
    pricingType: 'flat-rate'
  },
  {
    id: 'bev3',
    name: 'Beer Selection',
    description: 'Local and international beer selection - charged by case/quantity',
    category: 'Beverages',
    price: 45,
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Gluten'],
    dietaryType: 'vegan',
    pricingType: 'flat-rate'
  },
  {
    id: 'bev4',
    name: 'Soft Drinks Package',
    description: 'Assorted soft drinks, juices, and sparkling water - charged by quantity',
    category: 'Beverages',
    price: 35,
    image: 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: [],
    dietaryType: 'vegan',
    pricingType: 'flat-rate'
  },
  {
    id: 'bev5',
    name: 'Coffee & Tea Service',
    description: 'Fresh brewed coffee, espresso, and premium tea selection - per person',
    category: 'Beverages',
    price: 5,
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: [],
    dietaryType: 'vegan',
    pricingType: 'per-person'
  },
  {
    id: 'bev6',
    name: 'Cocktail Bar Package',
    description: 'Professional bartender with premium spirits and mixers for 4 hours',
    category: 'Beverages',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: [],
    dietaryType: 'vegan',
    pricingType: 'flat-rate'
  },
  {
    id: 'bev7',
    name: 'Champagne Welcome Reception',
    description: 'Premium champagne service for arrival (2 glasses per person)',
    category: 'Beverages',
    price: 18,
    image: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: ['Sulfites'],
    dietaryType: 'vegan',
    pricingType: 'per-person'
  },
  {
    id: 'bev8',
    name: 'Fresh Juice Bar',
    description: 'Freshly squeezed orange, apple, and mixed fruit juices - charged by quantity',
    category: 'Beverages',
    price: 40,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    allergens: [],
    dietaryType: 'vegan',
    pricingType: 'flat-rate'
  },
];

export const categories = [
  'Apéro',
  'Starters',
  'Intermediate Course',
  'Main Courses Meat/Fish',
  'Main Courses Veggie',
  'Main Courses Vegan',
  'Desserts',
  'Beverages',
  'Technology',
  'Decoration',
  'Furniture',
  'Miscellaneous'
];