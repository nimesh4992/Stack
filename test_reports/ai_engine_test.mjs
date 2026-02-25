// AI Engine Category Classification Test
// Testing the classifyMerchant function for common merchants

const MERCHANT_CATEGORY_MAP = {
  // Food & Dining
  'swiggy': { categoryId: 'food', label: 'Food & Dining' },
  'zomato': { categoryId: 'food', label: 'Food & Dining' },
  'dominos': { categoryId: 'food', label: 'Food & Dining' },
  
  // Transport
  'uber': { categoryId: 'transport', label: 'Transport' },
  'ola': { categoryId: 'transport', label: 'Transport' },
  'rapido': { categoryId: 'transport', label: 'Transport' },
  
  // Shopping
  'amazon': { categoryId: 'shopping', label: 'Shopping' },
  'flipkart': { categoryId: 'shopping', label: 'Shopping' },
  'myntra': { categoryId: 'shopping', label: 'Shopping' },
  
  // Entertainment
  'netflix': { categoryId: 'entertainment', label: 'Entertainment' },
  'spotify': { categoryId: 'entertainment', label: 'Entertainment' },
  
  // Bills
  'airtel': { categoryId: 'bills', label: 'Bills & Utilities' },
  'jio': { categoryId: 'bills', label: 'Bills & Utilities' },
  
  // Groceries
  'bigbasket': { categoryId: 'groceries', label: 'Groceries' },
  'blinkit': { categoryId: 'groceries', label: 'Groceries' },
};

function classifyMerchant(merchantName) {
  const normalizedName = merchantName.toLowerCase().trim();
  
  // Direct match
  for (const [keyword, category] of Object.entries(MERCHANT_CATEGORY_MAP)) {
    if (normalizedName.includes(keyword)) {
      return {
        categoryId: category.categoryId,
        categoryLabel: category.label,
        confidence: 0.95,
        alternativeCategories: [],
      };
    }
  }
  
  // Default to 'other'
  return {
    categoryId: 'other',
    categoryLabel: 'Other',
    confidence: 0.3,
    alternativeCategories: [],
  };
}

// Test cases
console.log("=== AI Engine Category Classification Tests ===\n");

const testCases = [
  { merchant: "Swiggy", expectedCategory: "food", expectedLabel: "Food & Dining" },
  { merchant: "SWIGGY ORDER", expectedCategory: "food", expectedLabel: "Food & Dining" },
  { merchant: "Amazon.in", expectedCategory: "shopping", expectedLabel: "Shopping" },
  { merchant: "amazon pay", expectedCategory: "shopping", expectedLabel: "Shopping" },
  { merchant: "Uber Ride", expectedCategory: "transport", expectedLabel: "Transport" },
  { merchant: "UBER", expectedCategory: "transport", expectedLabel: "Transport" },
  { merchant: "Zomato", expectedCategory: "food", expectedLabel: "Food & Dining" },
  { merchant: "Netflix", expectedCategory: "entertainment", expectedLabel: "Entertainment" },
  { merchant: "Airtel Recharge", expectedCategory: "bills", expectedLabel: "Bills & Utilities" },
  { merchant: "BigBasket", expectedCategory: "groceries", expectedLabel: "Groceries" },
  { merchant: "Unknown Store", expectedCategory: "other", expectedLabel: "Other" },
];

let passed = 0;
let failed = 0;

testCases.forEach((tc, index) => {
  const result = classifyMerchant(tc.merchant);
  const success = result.categoryId === tc.expectedCategory;
  
  if (success) {
    passed++;
    console.log(`✅ Test ${index + 1}: "${tc.merchant}" -> ${result.categoryLabel} (${result.categoryId}) - PASSED`);
  } else {
    failed++;
    console.log(`❌ Test ${index + 1}: "${tc.merchant}" -> Expected ${tc.expectedLabel} but got ${result.categoryLabel} - FAILED`);
  }
});

console.log(`\n=== Results ===`);
console.log(`Passed: ${passed}/${testCases.length}`);
console.log(`Failed: ${failed}/${testCases.length}`);
console.log(`Success Rate: ${Math.round((passed/testCases.length)*100)}%`);
