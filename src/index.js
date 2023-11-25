const { faker } = require('@faker-js/faker');
const { DisjointSet } = require('disjoint-set-ds');
const jsonToCsv = require('json-to-csv');
const lodash = require('lodash');


function* autoIncrementUserId() {
  let index = 0;
  while (true) yield index++;
}

function* firstNameGenerator(poolSize = 5) {
  let pool = faker.helpers.multiple(faker.person.firstName, {count: poolSize});
  while (true) yield pool[Math.floor((Math.random()*poolSize))];
}

function* lastNameGenerator(poolSize = 5) {
  let pool = faker.helpers.multiple(faker.person.lastName, {count: poolSize});
  while (true) yield pool[Math.floor((Math.random()*poolSize))];
}

function* emailGenerator(poolSize = 5) {
  let pool = faker.helpers.multiple(faker.internet.email, {count: poolSize});
  while (true) yield pool[Math.floor((Math.random()*poolSize))];
}

function* phoneGenerator(poolSize = 5) {
  let pool = faker.helpers.multiple(faker.phone.imei, {count: poolSize});
  while (true) yield pool[Math.floor((Math.random()*poolSize))];
}

const id = autoIncrementUserId();
const firstName = firstNameGenerator(5000);
const lastName = lastNameGenerator(5000);
const email = emailGenerator(10000);
const phone = phoneGenerator(10000);

const createRandomProfile = () => ({
  id: id.next().value,
  lastName: lastName.next().value,
  firstName: firstName.next().value,
  phone: phone.next().value, 
  email: email.next().value
});

const profileStores = faker.helpers.multiple(createRandomProfile, { count: 200000 })


const profileSet = new DisjointSet();
profileStores.forEach(profile => profileSet.makeSet(profile.id));

for (let i=0; i<profileStores.length; i++) {
  if (i % 1000 === 0) {
    console.log(`Current profile count: ${i}`)
  }

  const currentProfile = profileStores[i];

  // Rule 1 - First Name + Last Name + Email
  const ruleOneProfileIdList = profileStores.filter(p => (
    (p.id !== currentProfile.id)
    & (p.firstName == currentProfile.firstName)
    & (p.lastName == currentProfile.lastName)
    & (p.email == currentProfile.email)
  )).map(p => p.id);

  // Rule 2 - Fist Name + Last Name + Phone
  const ruleTwoProfileIdList = profileStores.filter(p => (
    (p.id !== currentProfile.id)
    & (p.firstName == currentProfile.firstName)
    & (p.lastName == currentProfile.lastName)
    & (p.phone == currentProfile.phone)
  )).map(p => p.id);

  // Rule 3 - Fist Name + Email + Phone
  const ruleThreeProfileIdList = profileStores.filter(p => (
    (p.id !== currentProfile.id)
    & (p.firstName == currentProfile.firstName)
    & (p.email == currentProfile.email)
    & (p.phone == currentProfile.phone)
  )).map(p => p.id);

  // Rule 4 - Last Name + Email + Phone
  const ruleFourProfileIdList = profileStores.filter(p => (
    (p.id !== currentProfile.id)
    & (p.lastName == currentProfile.lastName)
    & (p.email == currentProfile.email)
    & (p.phone == currentProfile.phone)
  )).map(p => p.id);
  
  [
    ...ruleOneProfileIdList,
    ...ruleTwoProfileIdList,
    ...ruleThreeProfileIdList,
    ...ruleFourProfileIdList
  ].forEach(pid => profileSet.union(pid, currentProfile.id))
}

const groupedProfileSet = profileStores.map(profile => {
  return {
    ...profile,
    group: profileSet.find(profile.id)
  }
})

const groupCount = lodash.countBy(groupedProfileSet, 'group');

const groupedProfileSetWithCount = groupedProfileSet.map(profile => {
  return {
    ...profile,
    groupCount: groupCount[profile.group]
  }
})

jsonToCsv(groupedProfileSetWithCount, 'output.csv')
