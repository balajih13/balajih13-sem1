
/** @module Surveys */

import sqlite from 'sqlite-async'

/**
 * Surveys
 * ES6 module that handles information retrieval on surveys
 */
class Surveys {
	/**
   * Create an account object
   * @param {String} [dbName=":memory:"] - The name of the database file to use.
   */
	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			// we need this table to store the user accounts
			const sql = 'CREATE TABLE IF NOT EXISTS surveys\
				(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT);'
			await this.db.run(sql)
			return this
		})()
	}
	/**
	 * returns information on a select survey
	 * @param {Number} id the survey to check
	 * @returns {Object} storing name and information for said survey
	 */
	async getSurveyInformation(surveyID) {
 		let sql = `SELECT count(id) AS count FROM surveys WHERE id="${surveyID}";`
		let records = await this.db.get(sql)
		if(!records.count) throw new Error(`survey with ID "${surveyID}" not found`)
		sql = `SELECT name, description FROM surveys WHERE id = "${surveyID}";`
		records = await this.db.get(sql)
		return records
	}

	async close() {
		await this.db.close()
	}
}

export default Surveys
