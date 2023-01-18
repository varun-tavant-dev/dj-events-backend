'use strict';

/**
 * event controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

//module.exports = createCoreController('api::event.event');
module.exports = createCoreController('api::event.event', ({strapi}) => ({
    //Find with populate ----------------------------------------
    async find(ctx) {
      const populateList = [
        'image',
        'user',
      ]
      // Push any additional query params to the array
      populateList.push(ctx.query.populate)
      ctx.query.populate = populateList.join(',')
      // console.log(ctx.query)
      const content = await super.find(ctx)
      return content
    },
  
    // Create user event----------------------------------------
    async create(ctx) {
        const {id} = ctx.state.user; //ctx.state.user contains the current authenticated user
        const response = await super.create(ctx);
        const updatedResponse = await strapi.entityService
                                    .update('api::event.event', response.data.id, {data: {user: id}})
        return updatedResponse;
    },
    // Update user event----------------------------------------
    async update(ctx) {
        var { id } = ctx.state.user
        var [article] = await strapi.entityService
            .findMany('api::event.event', {
                filters: {
                    id: ctx.request.params.id,
                    user: id
                }
            })
        if (article) {
            const response = await super.update(ctx);
            return response;
        } else {
            return ctx.unauthorized();
        }
    },
    // Delete user event----------------------------------------
    async delete(ctx) {
        var { id } = ctx.state.user
        var [article] = await strapi.entityService
            .findMany('api::event.event', {
                filters: {
                    id: ctx.request.params.id,
                    user: id
                }
            })
        if (article) {
            const response = await super.delete(ctx);
            return response;
        } else {
            return ctx.unauthorized();
        }
    },
    // Get logged in users----------------------------------------
    async me(ctx) {
      const user = ctx.state.user;
      if (!user) {
        return ctx.badRequest(null, [
          {messages: [{id: "No authorization header was found"}]},
        ]);
      }
      const query = {
        filters: {
          user: {id: user.id}
        }
      }
      const data = await this.find({query: query});
      if (!data) {
        return ctx.notFound();
      }
      const sanitizedEntity = await this.sanitizeOutput(data, ctx);
      return this.transformResponse(sanitizedEntity);
    },
}));