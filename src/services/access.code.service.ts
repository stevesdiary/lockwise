import { getFromRedis, saveToRedis } from '../core/redis';
// import { faker } from '@faker-js/faker'; // For future dynamic generation

class AccessCodeService {
  private static getRandomNumber(): string {
    return Math.floor(Math.random() * 90 + 10).toString();
  }

  private static getPoolByCategory(category: string): string[] {
    const pools = {
      animals: ['Dog', 'Cat', 'Eagle', 'Lion', 'Tiger', 'Bear', 'Wolf', 'Fox', 'Deer', 'Rabbit', 'Horse', 'Cow', 'Pig', 'Sheep', 'Goat', 'Duck', 'Chicken', 'Fish', 'Shark', 'Whale'],
      countries: ['Ghana', 'Canada', 'India', 'Nigeria', 'USA', 'UK', 'France', 'Germany', 'Japan', 'China', 'Brazil', 'Mexico', 'Australia', 'Egypt', 'Kenya', 'Morocco', 'Spain', 'Italy', 'Russia', 'Turkey'],
      colors: ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Brown', 'Black', 'White', 'Gray', 'Silver', 'Gold', 'Cyan', 'Magenta', 'Lime', 'Navy', 'Teal', 'Olive', 'Maroon'],
      foods: ['Pizza', 'Burger', 'Pasta', 'Rice', 'Bread', 'Cake', 'Apple', 'Banana', 'Orange', 'Grape', 'Chicken', 'Beef', 'Fish', 'Salad', 'Soup', 'Cheese', 'Milk', 'Coffee', 'Tea', 'Water', 'Amala', 'Eba', 'Fufu', 'Tuwo'],
      electroics: ['TV', 'Phone', 'Computer', 'Laptop', 'Tablet', 'Camera', 'Speaker', 'Headphones', 'Keyboard', 'Mouse', 'Printer', 'Scanner', 'Projector', 'Router', 'Monitor', 'Speaker', 'Microwave', 'Oven', 'Refrigerator', 'Blender'],
      random: ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel', 'India', 'Juliet', 'Kilo', 'Lima', 'Mike', 'November', 'Oscar', 'Papa', 'Quebec', 'Romeo', 'Sierra', 'Tango'],
      languages: ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Yoruba', 'Hausa', 'Igbo', 'Swahili', 'Amharic', 'Dutch', 'Swedish', 'Norwegian'],
      fruits: ['Mango', 'Orange', 'Banana', 'Apple', 'Pineapple', 'Grapes', 'Watermelon', 'Papaya', 'Peach', 'Cherry', 'Strawberry', 'Blueberry', 'Raspberry', 'Blackberry', 'Kiwi', 'Lemon', 'Lime', 'Coconut', 'Avocado', 'Fig'],
      vehicles: ['Car', 'Bike', 'Truck', 'Bus', 'Train', 'Boat', 'Plane', 'Helicopter', 'Scooter', 'Subway', 'Tram', 'Van', 'Motorcycle', 'Bicycle', 'Yacht', 'Ferry', 'Jet', 'Glider', 'Canoe', 'Kayak'],
      sports: ['Soccer', 'Basketball', 'Baseball', 'Tennis', 'Golf', 'Cricket', 'Rugby', 'Hockey', 'Volleyball', 'Swimming', 'Boxing', 'Wrestling', 'Cycling', 'Running', 'Skiing', 'Skating', 'Surfing', 'Climbing', 'Diving', 'Archery'],
      cars: ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Nissan', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Lexus', 'Acura', 'Infiniti', 'Cadillac', 'Chevrolet', 'Jeep', 'Tesla', 'Porsche'],
      cities: ['Lagos', 'London', 'Paris', 'Tokyo', 'NewYork', 'Dubai', 'Sydney', 'Toronto', 'Berlin', 'Madrid', 'Rome', 'Mumbai', 'Cairo', 'Nairobi', 'Accra', 'Abuja', 'Kano', 'Ibadan', 'Benin', 'Kaduna']
    };
    return pools[category as keyof typeof pools] || pools.animals;

    // Faker.js alternative (requires: npm install @faker-js/faker)
    // switch (category) {
    //   case 'animals': return Array.from({ length: 50 }, () => faker.animal.type());
    //   case 'countries': return Array.from({ length: 50 }, () => faker.location.country());
    //   case 'colors': return Array.from({ length: 50 }, () => faker.color.human());
    //   case 'foods': return Array.from({ length: 50 }, () => faker.commerce.productName());
    //   default: return Array.from({ length: 50 }, () => faker.word.sample());
    // }
  }

  static async refreshCategory(estateId: string): Promise<void> {
    const categories = ['animals', 'countries', 'colors', 'foods', 'cars', 'cities', 'languages'];
    const chosenCategory = categories[Math.floor(Math.random() * categories.length)];
    const values = this.getPoolByCategory(chosenCategory);

    await saveToRedis(`category:${estateId}`, chosenCategory, 604800); // 7 days
    await saveToRedis(`codes:${estateId}`, JSON.stringify(values), 604800);
  }

  static async generateCode(estateId: string): Promise<string> {
    try {
      const category = await getFromRedis(`category:${estateId}`);
      const poolRaw = await getFromRedis(`codes:${estateId}`);

      if (!category || !poolRaw) {
        await this.refreshCategory(estateId);
        const newPoolRaw = await getFromRedis(`codes:${estateId}`);
        if (newPoolRaw) {
          const pool: string[] = JSON.parse(newPoolRaw);
          const baseWord = pool[Math.floor(Math.random() * pool.length)];
          return `${baseWord}${this.getRandomNumber()}`;
        }
      } else {
        const pool: string[] = JSON.parse(poolRaw);
        const baseWord = pool[Math.floor(Math.random() * pool.length)];
        return `${baseWord}${this.getRandomNumber()}`;
      }
    } catch (error) {
      console.error('Category generation failed:', error);
    }

    // Fallback to random number if all else fails
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  static generateCustomCode(eventName: string): string {
    const cleanName = eventName.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
    return `${cleanName}${this.getRandomNumber()}`;
  }

  static async getCurrentCategory(estateId: string): Promise<string | null> {
    return await getFromRedis(`category:${estateId}`);
  }
}

export default AccessCodeService;