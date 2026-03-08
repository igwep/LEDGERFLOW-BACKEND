"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = exports.validateQuery = exports.validateBody = exports.validateRequest = void 0;
const zod_1 = require("zod");
const types_1 = require("../types");
const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            // Validate body
            if (schema.body) {
                req.body = schema.body.parse(req.body);
            }
            // Validate query parameters
            if (schema.query) {
                req.query = schema.query.parse(req.query);
            }
            // Validate route parameters
            if (schema.params) {
                req.params = schema.params.parse(req.params);
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const validationErrors = error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                next(new types_1.ValidationError('Validation failed', validationErrors));
            }
            else {
                next(error);
            }
        }
    };
};
exports.validateRequest = validateRequest;
const validateBody = (schema) => (0, exports.validateRequest)({ body: schema });
exports.validateBody = validateBody;
const validateQuery = (schema) => (0, exports.validateRequest)({ query: schema });
exports.validateQuery = validateQuery;
const validateParams = (schema) => (0, exports.validateRequest)({ params: schema });
exports.validateParams = validateParams;
//# sourceMappingURL=validation.js.map