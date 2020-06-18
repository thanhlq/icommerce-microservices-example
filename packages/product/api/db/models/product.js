module.exports = {
  name: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    type: String,
  },
  code: {
    type: String,
    index: true,
    unique: true
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
    type: Number,
    index: true,
  },
}
