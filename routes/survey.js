
import Router from 'koa-router'

const router = new Router({ prefix: '/survey/' })

import Accounts from '../modules/accounts.js'
import Surveys from '../modules/surveys.js'
const dbName = 'website.db'

async function checkAuth(ctx, next) {
	console.log('survey router middleware')
	console.log(ctx.hbs)
	if(ctx.hbs.authorised !== true) return ctx.redirect('/login?msg=you need to log in&referrer=/secure')
	await next()
}

router.use(checkAuth)

router.get('/', async ctx => {
	const accounts = await new Accounts(dbName)
	const surveys = await new Surveys(dbName)
	try {
		let results = await accounts.getUnansweredPosition(ctx.session.username, 1)
		if(results !== -1) results = await surveys.getQuestion(results, 1)
		else {
      await accounts.updateSurveysDone(ctx.session.username, 1)
      ctx.redirect('/')
		}
		ctx.hbs.record = results
		await ctx.render('survey', ctx.hbs)
	} catch(err) {
		ctx.hbs.error = err.message
		await ctx.render('error', ctx.hbs)
	} finally {
		accounts.close()
		surveys.close()
	}
})

router.post('/', async ctx => { //update score, refresh page
	const account = await new Accounts(dbName)
	try {
		await account.updateScore(ctx.session.username, 1, Number(ctx.request.body.score))
		ctx.redirect('/survey')
	} catch(err) {
		ctx.hbs.msg = err.message
		ctx.hbs.body = ctx.request.body
		console.log(ctx.hbs)
		await ctx.render('register', ctx.hbs)
	} finally {
		account.close()
	}
})

export default router
