/**
 * Middleware to validate guild access and permissions
 */
module.exports = async (req, res, next) => {
  const guild = req.client.guilds.cache.get(req.params.serverID);
  if (
    !guild ||
    !req.userInfos.displayedGuilds ||
    !req.userInfos.displayedGuilds.find((g) => g.id === req.params.serverID)
  ) {
    return res.render("404", {
      user: req.userInfos,
      currentURL: `${req.client.config.DASHBOARD.baseURL}/${req.originalUrl}`,
    });
  }
  
  // Add guild to request for downstream use
  req.guild = guild;
  next();
};
