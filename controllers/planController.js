import { NotFoundError } from "../errors/customErrors.js";
import Plan from "../models/SubscriptionPlanModel.js";

export const addPlan = async (req, res) => {
  const { planName, price, features } = req.body;
  const featuresArray = features.split(",");
  const newPlan = new Plan({
    planName: planName,
    price: price,
    features: features,
  });
  await newPlan.save();
  res.status(201).json({ message: "successfully created" });
};

export const getAllPlan = async (req, res) => {
  const plans = await Plan.find();
  if (!plans) throw new NotFoundError("plan not found");
  res.status(200).json(plans);
};

export const updatePlan = async (req, res) => {
  const { planName, price, features } = req.body;
  const { id } = req.params;
  const plan = await Plan.findById(id);
  if (!plan) throw new NotFoundError("plan not found");
  plan.planName = planName;
  plan.price = price;
  plan.features = features;
  await plan.save();
  res.status(200).json({ message: "plan is updated" });
};

export const getSinglePlan = async (req, res) => {
  const { id } = req.params;
  const plan = await Plan.findById(id);
  if (!plan) throw new NotFoundError("plan not found");
  res.status(200).json(plan);
};

export const deletePlan = async (req, res) => {
  const { id } = req.params;
  const plan = await Plan.findByIdAndDelete(id);
  if (!plan) throw new NotFoundError("plan not found");
  res.status(200).json({ message: "plan is deleted" });
};
