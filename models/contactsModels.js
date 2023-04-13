const fs = require("fs/promises");
const Joi = require("joi");

const contactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.number().required(),
});

const listContacts = async () => {
  const data = await fs.readFile("./models/contacts.json", "utf-8");
  const contacts = JSON.parse(data);
  return contacts;
};

const getContactById = async (contactId) => {
  const contacts = await listContacts();
  const searchedContact = contacts.find((contact) => contact.id === contactId);
  return searchedContact;
};

const removeContact = async (contactId) => {
  const contacts = await listContacts();
  const filteredContacts = contacts.filter(
    (contact) => contact.id !== contactId
  );
  await fs.writeFile(
    "./models/contacts.json",
    JSON.stringify(filteredContacts)
  );
};

const addContact = async (body) => {
  const contacts = await listContacts();
  const nextId = Number(contacts.length + 1);
  const newContact = { ...body, id: nextId.toString() };
  contacts.push(newContact);
  await fs.writeFile("./models/contacts.json", JSON.stringify(contacts));
};

const updateContact = async (contactId, body) => {
  const contacts = await listContacts();
  const indexToFind = contacts.findIndex((contact) => contact.id === contactId);
  if (indexToFind === -1) {
    return;
  }
  contacts[indexToFind] = { id: contactId, ...body };
  await fs.writeFile("./models/contacts.json", JSON.stringify(contacts));
  return contacts[indexToFind];
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  contactSchema,
};
