import * as helpTicketService from "../services/helpTicketService.js";

export async function createHelpTicket(req, res, next) {
  try {
    const { category, message } = req.body ?? {};
    const ticket = await helpTicketService.createHelpTicket(req.currentUser, {
      category,
      message,
    });
    res.status(201).json(ticket);
  } catch (err) {
    next(err);
  }
}
