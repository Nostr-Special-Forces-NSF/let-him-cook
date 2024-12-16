// Assuming DEFAULT_RELAYS is an array of strings
export const DEFAULT_RELAYS = ['wss://nsf.testrelay.xyz', 'wss://relay.damus.io', 'wss://nos.lol'];

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
	{ displayName: 'Ingredients', name: 'ingredients', values: INGREDIENTS },
	{ displayName: 'Cuisine', name: 'cuisine', values: CUISINES },
	{ displayName: 'Category', name: 'category', values: CATEGORIES },
	{ displayName: 'Prep Time', name: 'prep_time', values: PREP_TIMES },
	{ displayName: 'Cook Time', name: 'cook_time', values: COOK_TIMES },
	{ displayName: 'Servings', name: 'servings', values: SERVINGS },
	{ displayName: 'Author', name: 'author', values: AUTHORS }
];
