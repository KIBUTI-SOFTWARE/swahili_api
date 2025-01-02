const helmet = require('helmet');

const securityMiddleware = [
  helmet(),
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  }),
  helmet.crossOriginEmbedderPolicy(),
  helmet.crossOriginOpenerPolicy(),
  helmet.crossOriginResourcePolicy(),
  helmet.dnsPrefetchControl(),
  helmet.expectCt(),
  helmet.frameguard(),
  helmet.hidePoweredBy(),
  helmet.hsts(),
  helmet.ieNoOpen(),
  helmet.noSniff(),
  helmet.originAgentCluster(),
  helmet.permittedCrossDomainPolicies(),
  helmet.referrerPolicy(),
  helmet.xssFilter()
];

module.exports = securityMiddleware;