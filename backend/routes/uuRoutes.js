if (segments[0] === "api" && segments[1] === "uu") {
  const fakeReq = { method: req.method, query, params: {} };

  if (req.method === "GET" && path === "/api/uu/referee/overview") {
    return uuController.getRefereeOverview(fakeReq, res);
  }

  if (req.method === "GET" && path === "/api/uu/referee/members") {
    return uuController.getRefereeMembers(fakeReq, res);
  }

  if (req.method === "GET" && segments[2] === "referee" && segments[3]) {
    fakeReq.params.refereeId = segments[3];
    return uuController.getRefereeDetails(fakeReq, res);
  }

  if (req.method === "GET" && path === "/api/uu/referral/overview") {
    return uuController.getReferralOverview(fakeReq, res);
  }

  if (req.method === "GET" && path === "/api/uu/referral/members") {
    return uuController.getReferralMembers(fakeReq, res);
  }

  if (req.method === "GET" && segments[2] === "referral" && segments[3]) {
    fakeReq.params.referralId = segments[3];
    return uuController.getReferralDetails(fakeReq, res);
  }

  return sendJson(res, 404, { message: "Route not found" });
}