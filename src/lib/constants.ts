// Assuming DEFAULT_RELAYS is an array of strings
export const DEFAULT_RELAYS = ['wss://nsf.testrelay.xyz'];

const INGREDIENTS = [
	'Olive oil',
	'Balsamic',
	'Ketchup',
	'Mayonnaise',
	'Mustard',
	'Soy sauce',
	'Hot sauce',
	'Worcestershire',
	'Salt',
	'Pepper',
	'Oregano',
	'Beans',
	'Rice',
	'Olives'
];

const CUISINES = ['American', 'Indian', 'Italian', 'Mediterranean', 'Arabic'];
const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Main Course'];
const PREP_TIMES = ['5', '10', '15', '20', '25', '30'];
const COOK_TIMES = ['5', '10', '15', '20', '25', '30'];
const SERVINGS = ['1', '2', '3', '4', '5'];
const AUTHORS = [
	'Heidi Swanson',
	'McCormick',
	'Ela',
	'Alison Andrews',
	'nash',
	'Petey',
	'Lindy Lawler',
	'Kay Chun',
	'Vaugn Vreeland'
];

export const FILTERS = [
	{ name: 'Ingredients', values: INGREDIENTS },
	{ name: 'Cuisine', values: CUISINES },
	{ name: 'Category', values: CATEGORIES },
	{ name: 'Prep Time', values: PREP_TIMES },
	{ name: 'Cook Time', values: COOK_TIMES },
	{ name: 'Servings', values: SERVINGS },
	{ name: 'Author', values: AUTHORS }
];
