const Joi = require("joi");

const taskSchema = Joi.object({
  title: Joi.string().trim().min(3).max(30).required(),
  isCompleted: Joi.boolean().default(false).not(null),
  priority: Joi.string().valid("low", "medium", "high").default("medium")
});

const patchTaskSchema = Joi.object({
  title: Joi.string().trim().min(3).max(30).not(null),
  isCompleted: Joi.boolean().not(null),
  priority: Joi.string().valid("low", "medium", "high")
}).min(1).message("No attributes to change were specified.");

const bulkUpdateSchema = Joi.object({
  ids: Joi.array()
    .items(Joi.number())
    .unique()
    .min(1).message("No ids to change were specified.")
    .required(),
  title: Joi.string().trim().min(3).max(30).not(null),
  isCompleted: Joi.boolean().not(null),
  priority: Joi.string().valid("low", "medium", "high")
})

const bulkDeleteSchema = Joi.object({
  ids: Joi.array()
    .items(Joi.number())
    .unique()
    .min(1).message("No ids to change were specified.")
    .required(),
})

module.exports = { taskSchema, patchTaskSchema, bulkUpdateSchema, bulkDeleteSchema };