package com.nazonazo_app.shit_forces.contest

import com.nazonazo_app.shit_forces.account.AccountInfo
import com.nazonazo_app.shit_forces.account.SharedAccountService
import com.nazonazo_app.shit_forces.problem.ResponseProblemInfo
import com.nazonazo_app.shit_forces.session.SharedSessionService
import com.nazonazo_app.shit_forces.submission.RequestSubmission
import com.nazonazo_app.shit_forces.submission.SubmissionInfo
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import javax.servlet.http.HttpServletRequest

const val ONE_PAGE_SIZE = 20
const val SUBMIT_INTERVAL_TIME = 5 * 1000

@CrossOrigin
@RestController
class ContestController(val contestService: ContestService,
                        val sharedContestService: SharedContestService,
                        val sharedAccountService: SharedAccountService,
                        val sharedSessionService: SharedSessionService
                        ) {
    data class RequestContest constructor(val id: String, val name: String,
                                          val startTime: Float, val endTime: Float, val rated: Boolean)

    @PostMapping("api/contests/{contest-id}/rating")
    fun updateRatingByContestResult(@PathVariable("contest-id") contestId: String,
                                    httpServletRequest: HttpServletRequest) {
        val contest = contestService.getContestInfoByContestId(contestId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        val sessionAccountName = sharedSessionService.getSessionAccountName(httpServletRequest)
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST)
        val accountInfo = sharedAccountService.getAccountByName(sessionAccountName)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        if (accountInfo.authority !== AccountInfo.AccountAuthority.ADMINISTER) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
        contestService.updateRating(contest)
    }
    @GetMapping("api/contests/{contest-id}/ranking")
    fun getContestRankingResponse(@PathVariable("contest-id") contestId: String,
                                  @RequestParam(value="page") page: Int,
                                  httpServletRequest: HttpServletRequest
    ): RequestRanking {
        val sessionAccountName = sharedSessionService.getSessionAccountName(httpServletRequest)
        return sharedContestService.getContestRanking(contestId, page, sessionAccountName)
            ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR)
    }

    @GetMapping("api/contests/{contest-id}")
    fun getContestInfoByContestIdResponse(@PathVariable("contest-id") contestId: String):ContestInfo {
        return contestService.getContestInfoByContestId(contestId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
    }

    @GetMapping("api/contests/latest")
    fun getLatestContestsInfoResponse(@RequestParam("contest_num") contestNum: Int?):List<ContestInfo> {
        return contestService.getLatestContestsInfo(contestNum)
            ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR)
    }
    /*
    @PostMapping("api/contests/", headers = ["Content-Type=application/json"])
    fun addContestResponse(@RequestBody requestContest: RequestContest):ContestInfo {
        return contestService.addContest(requestContest)
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
    }
     */

    @GetMapping("api/submissions/{account-name}")
    fun getAccountSubmissionOfContestResponse(@PathVariable("account-name") accountName: String,
                                              @RequestParam("contest_id") contestId: String,
                                              httpServletRequest: HttpServletRequest
    ): List<SubmissionInfo> {
        return contestService.getAccountSubmissionOfContest(accountName, contestId, httpServletRequest)
            ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR)
    }
    @PostMapping("api/submissions", headers = ["Content-Type=application/json"])
    fun submitAnswerResponse(@RequestBody requestSubmission: RequestSubmission,
                             httpServletRequest: HttpServletRequest
    ): SubmissionInfo {
        return contestService.submitAnswerToContest(requestSubmission, httpServletRequest)
    }
    @GetMapping("api/contests/{contest_id}/problems")
    fun getContestProblemsResponse(@PathVariable("contest_id") contestId: String,
                                   httpServletRequest: HttpServletRequest
    ): List<ResponseProblemInfo> {
        val problems = contestService.getContestProblems(contestId, httpServletRequest)
        return problems?.map{
            ResponseProblemInfo(it.contestName, it.point, it.statement, it.indexOfContest)
        } ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR)
    }
    @PostMapping("api/contests/{contest_id}/new-rating")
    fun updateRatingByContestResultResponse(@PathVariable("contest_id") contestId: String,
                                            httpServletRequest: HttpServletRequest) {

        val contestInfo = contestService.getContestInfoByContestId(contestId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        val accountName = sharedSessionService.getSessionAccountName(httpServletRequest)
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
        val requestAccount = sharedAccountService.getAccountByName(accountName)
        if (requestAccount?.authority != AccountInfo.AccountAuthority.ADMINISTER) {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
        }
        contestService.updateRating(contestInfo)
    }

}