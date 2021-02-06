import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { getCookieArray } from './share-func/GetCookieArray';
import { getAccountInformation } from './share-func/HttpRequest';

// URL: /account/$accountName

interface AccountInformationBodyProps {
  name: string;
  rating: number;
}

const AccountInformationBody: React.FC<AccountInformationBodyProps> = (
  props
) => {
  const logOutAccount = () => {
    document.cookie = `_sforce_account_name=; max-age=0; path=/`;
    window.location.href = '/';
  };

  const getLogOutButtonIfMyAccount = () => {
    const cookieArray = getCookieArray();
    if (cookieArray['_sforce_account_name'] === props.name) {
      return (
        <Button variant={'primary'} onClick={logOutAccount}>
          ログアウト
        </Button>
      );
    }
  };

  return (
    <div>
      <p>アカウント名: {props.name}</p>
      <p>レート: {props.rating}</p>
      {getLogOutButtonIfMyAccount()}
    </div>
  );
};

AccountInformationBody.propTypes = {
  name: PropTypes.string.isRequired,
  rating: PropTypes.number.isRequired,
};

const AccountNotFound: React.FC = () => {
  return (
    <div>
      <p>アカウントが見つかりませんでした</p>
    </div>
  );
};

export const AccountPage: React.FC = () => {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);

  const getAccount = useCallback(() => {
    const splitUrl = window.location.href.split('/');
    const accountName = splitUrl[splitUrl.length - 1];
    getAccountInformation(accountName)
      .then((account) => {
        setName(account.name);
        setRating(account.rating);
      })
      .catch(() => {
        setName('');
        setRating(0);
      });
  }, []);

  useEffect(() => {
    getAccount();
  }, []);

  let page;

  if (name !== '' && rating !== 0) {
    page = <AccountInformationBody name={name} rating={rating} />;
  } else {
    page = <AccountNotFound />;
  }
  return <div>{page}</div>;
};
