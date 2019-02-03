const faker = require('faker');
const randomstring = require('randomstring');
const Customer = require('./models/customers');
let address = faker.address.streetAddress() + ' ' + faker.address.city() + ' ' + faker.address.state();
async function seedCustomers() {
  await Customer.remove({});
  for(const i of new Array(1000)) {
    const customer = {
      week: Math.floor(Math.random() * 4 + 1),
      day: Math.floor(Math.random() * 5 + 1),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      companyName: faker.company.companyName(),
      tech: { 
        id: '5bdb2117c21b0f0940e96b37', 
        username: 'darrellpawson', 
        route: Math.floor(Math.random() * 7 + 1)
      },
      phoneNumber: '3363027348',
      address: address,
      preference: 'text',
      frequency: 1,
      fromTime: 'anytime',
      toTime: 'anytime',
    }
    await Customer.create(customer);
  }
  console.log('customers created')
}

module.exports = seedCustomers;