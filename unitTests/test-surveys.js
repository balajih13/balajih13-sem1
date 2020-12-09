
import test from 'ava'
import Surveys from '../modules/surveys.js'

test('GET SURVEY INFORMATION    : invalid id', async test => {
	test.plan(1)
	const surveys = await new Surveys()
	try {
		await surveys.getSurveyInformation(1)
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'survey with ID "1" not found', 'incorrect error message')
	} finally {
		surveys.close()
	}
})

test('GET QUESTION    : invalid id', async test => {
	test.plan(1)
	const surveys = await new Surveys()
	try {
		await surveys.getSurveyInformation(1, 2)
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'survey with ID "1" not found', 'incorrect error message')
	} finally {
		surveys.close()
	}
})
