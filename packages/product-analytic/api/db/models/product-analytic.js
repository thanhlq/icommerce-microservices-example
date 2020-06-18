/* The model for storing of the customer's product search/filtering */

module.exports = {
  /* the text the customer often search */
  searchText: {
    type: String,
    index: true,
  },
  name: {
    type: String,
    index: true,
  },
  code: {
    type: String,
    index: true,
  },
  color: {
    type: String,
    index: true,
  },
  branch: {
    type: String,
    index: true,
  },
  price: {
    type: String,
    index: true,
  },
}
