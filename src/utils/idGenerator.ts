function generateEstateId(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString(); // Generates an 8-digit random number
}

function generateResidentId(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString(); // Generates an 8-digit random number
}

function generateId(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString(); // Generates an 8-digit random number
}

export { generateEstateId, generateResidentId, generateId  };
