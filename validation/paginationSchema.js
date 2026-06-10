const Joi = require("joi");

const paginationSchema = Joi.object({
page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid("createdAt","title","priority","isCompleted", "id").default("createdAt"), 
  sortDirection: Joi.string().valid("asc","desc").default("desc"), 
  find: Joi.string()
})

module.exports = paginationSchema ;