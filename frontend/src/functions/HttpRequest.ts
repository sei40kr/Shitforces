/***
 * @class AccountInfo
 * @type {Object}
 * @property {Number} rating
 * @property {String} accountName
 * @property {String} auth
 */

/***
 * @class SubmissionResult
 * @type {Object}
 * @property {String} result
 * @property {String} statement
 * @property {String} submitTime
 */

/***
 * @class RankingInfo
 * @type {Object}
 * @property {Number} partAccountNum - 参加者数
 * @property {Array} rankingList - 順位表
 * @property {Number} requestAccountRank - リクエストしたユーザーの順位
 * @property {Array} acPerSubmit - AC/Submitの数 .firstにAC人数、.secondに提出人数
 */

/***
 * @class ContestInfo
 * @type {Object}
 * @property {String} id
 * @property {String} name
 * @property {String} statement - コンテストの説明
 * @property {String} startTimeAMPM - コンテスト開始時間のフォーマット済文字列
 * @property {String} endTimeAMPM - コンテスト終了時間のフォーマット済文字列
 * @property {String} contestType - コンテスト形式 ICPC,AtCoder形式など
 * @property {Number} ratedBound  - rated上限 0ならばunrated
 * @property {Number} unixStartTime - Unix時間でのコンテスト開始時間
 * @property {Number} unixEndTime - Unix時間でのコンテスト終了時間
 * @property {Boolean} ratingCalculated - レート計算済みかどうか
 */

/***
 * @class SubmissionInfo
 * @type {Object}
 * @property {String} contestName
 * @property {Number} indexOfContest
 * @property {String} accountName
 * @property {String} statement - 答案
 * @property {String} submitTime - 提出時間
 * @property {String} result
 */

/***
 * @class ProblemInfo
 * @type {Object}
 * @type {String} contestName
 * @type {Number} point - 問題の得点
 * @type {String} statement - 問題文
 * @type {Number} indexOfContest - コンテストの何番目の問題か
 */

/**
 * @return Promise<Object>
 */
export async function httpRequest(
  fetchTo: string,
  method: string,
  params?: any
) {
  if (process?.env?.REACT_APP_BACKEND_URL !== undefined) {
    fetchTo = process.env.REACT_APP_BACKEND_URL + fetchTo;
  }
  let initState = undefined;
  if (method === 'GET' || method === 'HEAD') {
    if (params !== undefined) {
      fetchTo += '?' + new URLSearchParams(params);
    }
  } else {
    initState = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: params,
    };
  }
  return await fetch(fetchTo, initState)
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.status.toString());
      }
      return response.text();
    })
    .then((val) => {
      try {
        if (val === '') return  val;
        else return JSON.parse(val);
      } catch {
        throw Error('Json String Error');
      }
    });
}

/***
 *
 * @param {String} contestId
 * @param {Number} indexOfContest
 * @param {String} statement
 * @returns {Promise<SubmissionResult>}
 */
export function postSubmission(
  contestId: string,
  indexOfContest: string,
  statement: string
) {
  const param = {
    contestId: contestId,
    indexOfContest: indexOfContest,
    statement: statement,
  };
  return httpRequest('/api/submissions', 'POST', JSON.stringify(param));
}

/***
 *
 * @param  {Number} page - 順位表何ページ目かの指定 1ページ20 (+1 ログインアカウント用 未実装)
 * @param  {String} contestId - コンテスト短縮名(urlの名前)
 * @returns {Promise<RankingInfo>}  rankingInfo
 *
 */
export function getRankingInfo(page: number, contestId: string) {
  return httpRequest(`/api/contests/${contestId}/ranking`, 'GET', {
    page: page,
  });
}

/***
 * @param {String} contestId - コンテスト短縮名(urlの名前)
 * @return {Promise<ContestInfo>}
 */
export function getContestInfo(contestId: string) {
  return httpRequest(`/api/contests/${contestId}`, 'GET');
}

/***
 *
 * @param {String} accountName
 * @returns {Promise<Object>}
 */
export function getAccountInformation(accountName: string) {
  const fetchTo = '/api/account/' + accountName;
  return httpRequest(fetchTo, 'GET');
}

/**
 * @returns {Promise<Array<ContestInfo>>}
 */
export function getLatestContests() {
  return httpRequest('/api/contests/latest', 'GET');
}

/**
 *
 * @param {String} contestId
 * @param {String} accountName
 * @returns {Promise<SubmissionInfo>}
 */
export function getSubmission(contestId: string, accountName: string) {
  const param = {
    ['contest_id']: contestId,
  };
  return httpRequest(`/api/submissions/${accountName}`, 'GET', param);
}

/**
 *
 * @param {String} contestId
 * @returns {Promise<Array<ProblemInfo>>}
 */
export function getContestProblems(contestId: string) {
  return httpRequest(`/api/contests/${contestId}/problems`, 'GET');
}

/**
 *
 * @param {String} fetchTo アカウント情報のポスト先 /api/login か /api/signup
 * @param accountName
 * @param password
 * @returns {Promise<Null>}
 */
export function postAccountInformation(
  fetchTo: string,
  accountName: string,
  password: string
) {
  const jsonBody = JSON.stringify({
    name: accountName,
    password: password
  });
  return httpRequest(fetchTo, 'POST', jsonBody);
}

export function updateContestRating(
    contestId: string
) {
    return httpRequest(`/api/contests/${contestId}/rating`, 'POST')
}

/**
 *
 * @param prevAccountName
 * @param newAccountName
 * @param password
 * @returns {Promise<Null>}
 */
export function putAccountName(
  prevAccountName: string,
  newAccountName: string,
  password: string
) {
  const jsonBody = JSON.stringify({
    name: newAccountName,
    password: password
  });
  return httpRequest(`/api/account/${prevAccountName}/name`, 'PUT', jsonBody)
}
