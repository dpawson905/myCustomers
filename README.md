# myCustomers

myCustomers is a system that is used to store customer data and has a way for a tech to text 
a customer and also look at where the customer is located by their address.

## Whats working now
  - Verification using twilio. Users are stored in temp collection until verified. Temp user is deleted once verified and moved to the user collection. Temp user also expires after 24 hours if not verified.
  - Verification token is generated and stored in its own collection and is what is sent via Twilio to the user that is registering. Token expires after 12 hours.
  - Techs can store customer data and search them by week and day or by name or phone number.
  - Customers are stored with the following data.
   1) Week and Day
   2) First Name
   3) Last Name
   4) Company Name (if needed)
   5) Phone Number
   6) Address - with autocomplete
   7) Frequency (monthly, bi-monthly, quarterly)
   8) Contact preference (call or text)
   9) Schedule From and To times
  - When a customer searched by week and day it uses moment to check against the database for stored service dates and only shows customers that are due now.
  - Mapbox api to see a map of where the customer is located based on address.
  - Customer text notifications to remind them of their appointment.
  - User account timeout based on failed login attempts.
  - User account locking based on failed login attempts.
  - Password reset

## Future features

  - Use twilio to call a customer to inform them of their appointment.
  - Routing based on a list of addresses (might have to switch to Google Maps for this.)
  - Move passwords to their own collection and set them to expire after 6 months. Link passwords to users collection.


### Installation

myCustomers requires [Node.js](https://nodejs.org/) v8+ to run.

Install the dependencies and devDependencies and start the server.

```sh
$ cd dillinger
$ npm i
$ npm i -g nodemon
$ npm run dev
```

### Development

Want to contribute? Great!




