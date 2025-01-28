const { faker } = require('@faker-js/faker');

const generateMockProducts = (count = 100) => {
    return Array.from({ length: count }, () => ({
        _id: faker.database.mongodbObjectId(),
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: faker.commerce.price(10, 200, 2, '$'),
        category: faker.commerce.department(),
        stock: faker.datatype.number({ min: 0, max: 100 }),
        status: faker.datatype.boolean(),
        thumbnail: faker.image.imageUrl()
    }));
};

module.exports = generateMockProducts;
