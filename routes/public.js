
import Router from 'koa-router'
import bodyParser from 'koa-body'

const router = new Router()
router.use(bodyParser({multipart: true}))

import Accounts from '../modules/accounts.js'
import Surveys from '../modules/surveys.js'
const dbName = 'website.db'

/**
 * The secure home page.
 *
 * @name Home Page
 * @route {GET} /
 */
router.get('/', async ctx => {
	try {
		const surveys = await new Surveys(dbName)
		const surveyInformation = await surveys.getSurveyInformation(1)
		ctx.hbs.record = {}
		ctx.hbs.record.name = surveyInformation.name
		ctx.hbs.record.description = surveyInformation.description
		if(ctx.session.authorised === true) {
			const accounts = await new Accounts(dbName)
			const surveyCompleted = await accounts.getSurveysDone(ctx.session.username)
			ctx.hbs.record.status = false
			if(surveyCompleted.includes('1')) {
				ctx.hbs.record.status = true
				ctx.hbs.record.score = await accounts.getSurveyScore(ctx.session.username, 1)
			}
		} ; await ctx.render('index', ctx.hbs)
	} catch(err) {
		console.log(err.message) ;await ctx.render('error', ctx.hbs)
	}
})

/**
 * The user registration page.
 *
 * @name Register Page
 * @route {GET} /register
 */
router.get('/register', async ctx => await ctx.render('register'))

/**
 * The script to process new user registrations.
 *
 * @name Register Script
 * @route {POST} /register
 */
router.post('/register', async ctx => {
	const account = await new Accounts(dbName)
	try {
		// call the functions in the module
		await account.register(ctx.request.body.user, ctx.request.body.pass, ctx.request.body.email)
		ctx.redirect(`/login?msg=new user "${ctx.request.body.user}" added, you need to log in`)
	} catch(err) {
		ctx.hbs.msg = err.message
		ctx.hbs.body = ctx.request.body
		console.log(ctx.hbs)
		await ctx.render('register', ctx.hbs)
	} finally {
		account.close()
	}
})

router.get('/login', async ctx => {
	console.log(ctx.hbs)
	await ctx.render('login', ctx.hbs)
})

router.post('/login', async ctx => {
	const account = await new Accounts(dbName)
	ctx.hbs.body = ctx.request.body
	try {
		const body = ctx.request.body
		await account.login(body.user, body.pass)
		ctx.session.username = body.user
		ctx.session.authorised = true
		// 		const referrer = body.referrer || '/secure'
		return ctx.redirect('/?msg=you are now logged in...')
	} catch(err) {
		ctx.hbs.msg = err.message
		await ctx.render('login', ctx.hbs)
	} finally {
		account.close()
	}
})

router.get('/logout', async ctx => {
	ctx.session.authorised = null
	ctx.redirect('/?msg=you are now logged out')
})

export default router
