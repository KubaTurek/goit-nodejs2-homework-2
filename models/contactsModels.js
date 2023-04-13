const Joi = require("joi");
const { Contact } = require("./contact");

const contactValidationSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.number().required(),
});

const listContacts = async () => {
  const data = await Contact.find();
  return data;
};

const getContactById = async (_id) => {
  const contact = await Contact.findOne({ _id });
  return contact;
};

const removeContact = async (_id) => {
  const contact = await Contact.findByIdAndDelete({ _id });
  return contact
};

const addContact = async (name, email, phone) => {
  const newContact = new Contact(name, email, phone);
  newContact.save();
  return newContact;
};

const updateContact = async (contactId, newContact) => {
  const updatedContact = await Contact.findByIdAndUpdate(contactId, newContact);
  return updatedContact;
};

const updateStatusContact = async (contactId, body) => {
  await Contact.findByIdAndUpdate(contactId, body);
  return await getContactById(contactId)
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
  contactValidationSchema,
};
