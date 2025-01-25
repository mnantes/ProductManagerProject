const { faker } = require('@faker-js/faker');

const generateMockProducts = (count = 100) => {
    const products = [];

    for (let i = 0; i < count; i++) {
        products.push({
            _id: faker.database.mongodbObjectId(),
            title: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            price: parseFloat(faker.commerce.price()),
            stock: faker.number.int({ min: 0, max: 100 }),
            category: faker.commerce.department(),
            thumbnails: [faker.image.url()],
            code: faker.string.alphanumeric(10),
            status: faker.datatype.boolean()
        });
    }

    return products;
};

module.exports = generateMockProducts;
