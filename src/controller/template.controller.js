import * as templateService from "../service/template.service.js";

export const getTemplates = (req, res) => {
  return res.status(200).json({
    message: "Templates retrieved successfully",
    data: templateService.list(),
  });
};
