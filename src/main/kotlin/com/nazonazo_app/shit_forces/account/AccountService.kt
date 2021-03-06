package com.nazonazo_app.shit_forces.account

import com.nazonazo_app.shit_forces.session.SharedSessionService
import com.nazonazo_app.shit_forces.submission.SharedSubmissionService
import org.springframework.http.HttpStatus
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.util.*
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

@Transactional
@Service
class AccountService(val accountInfoRepository: AccountInfoRepository,
                     val sharedSubmissionService: SharedSubmissionService,
                     val sharedSessionService: SharedSessionService){

    private fun createConnectedPassword(accountName: String, password: String): String {
        return Base64.getEncoder().encodeToString("$accountName:$password".toByteArray())
    }
    private fun createHashPassword(accountName: String, password: String): String {
        val bcrypt = BCryptPasswordEncoder()
        return bcrypt.encode(createConnectedPassword(accountName, password))
    }

    private fun isSamePassword(name: String, password: String): Boolean {
        val savedPasswordHash = accountInfoRepository.findByAccountName(name)?.passwordHash
        return BCryptPasswordEncoder().matches(createConnectedPassword(name, password), savedPasswordHash)
    }

    fun createAccount(requestAccount: RequestAccount): AccountInfo? =
        try {
            if (requestAccount.name.length < 4) {
                throw Error("名前が短すぎます")
            }
            if (accountInfoRepository.findByAccountName(requestAccount.name) != null) {
                throw Error("名前が重複しています")
            }
            val account = accountInfoRepository.createAccount(
                requestAccount.name,
                createHashPassword(requestAccount.name, requestAccount.password)) ?: throw Error("アカウント作成に失敗しました")
            account
        } catch (e: Error) {
            print(e)
            null
        }

    fun loginAccount(requestAccount: RequestAccount, servletResponse: HttpServletResponse): Boolean =
        if(!isSamePassword(requestAccount.name, requestAccount.password)) {
            false
        } else {
            sharedSessionService.createNewSession(requestAccount.name, servletResponse) != null
        }

    fun changeAccountName(prevAccountName: String,
                          requestAccount: RequestAccount,
                          httpServletRequest: HttpServletRequest,
                          httpServletResponse: HttpServletResponse
    ) {
        if (!isSamePassword(prevAccountName, requestAccount.password)) {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
        }
        accountInfoRepository.changeAccountName(prevAccountName, requestAccount.name,
            createHashPassword(requestAccount.name, requestAccount.password))
        sharedSessionService.deleteSession(prevAccountName)
        sharedSessionService.createNewSession(requestAccount.name, httpServletResponse)
        sharedSubmissionService.changeSubmissionAccountName(prevAccountName, requestAccount.name)
        accountInfoRepository.changeAccountRatingChangeHistoryName(prevAccountName, requestAccount.name)
    }
}