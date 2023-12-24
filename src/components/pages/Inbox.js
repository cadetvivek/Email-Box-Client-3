import React, { Fragment, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import styles from "./Home.module.css";
import { getUsername } from "../../helper";
import { mailActions } from "../../store/mailSlice";
import Mail from "./Mail";

const Inbox = () => {
  const dispatch = useDispatch();
  const [inboxMail, setInboxMail] = useState([]);
  const user = localStorage.getItem("email");
  const username = getUsername(user);
  useEffect(() => {
    const timer = setInterval(() => {
      let mails = [];  
    
    fetch(
      `https://mail-box-49aa1-default-rtdb.firebaseio.com/${username}/receiver.json`
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        let notOpened = 0;
        for (let [key, value] of Object.entries(data)) {
          mails.push({ key, ...value });
          if (value.isOpen === false) {
            notOpened += 1;
          }
        }
        setInboxMail(mails);
        dispatch(mailActions.countNotOpened(notOpened));
      })
  
    }, 2000);
    return () => clearInterval(timer);
  }, [dispatch]);

  const deleteHandler = (key) => {
     fetch(`https://mail-box-49aa1-default-rtdb.firebaseio.com/${username}/receiver/${key}.json`, {
        method: "DELETE",
    }).then((res) => {
      const inboxMailCopy = [...inboxMail]
        const index = inboxMailCopy.findIndex((item) => item.key === key);
        inboxMailCopy.splice(index, 1)
        setInboxMail(inboxMailCopy);
    })
  }

  const notOpened = useSelector((state) => state.mail.totalNotOpened);

  return (
    <Fragment>
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <NavLink
            to="/home"
            className={styles.none}
            activeClassName={styles.active}
          >
            {" "}
            <div>Compose</div>
          </NavLink>
          <NavLink
            to="/inbox"
            className={styles.none}
            activeClassName={styles.active}
          >
            <div>
              Inbox <span className={styles.unread}>Unread ({notOpened})</span>
            </div>
          </NavLink>
          <NavLink
            to="/sent"
            className={styles.none}
            activeClassName={styles.active}
          >
            {" "}
            <div>Sent</div>
          </NavLink>
        </div>

        <div className={styles.mailsContainer}>
          {inboxMail.map((mail) => {
            return <Mail key={mail.key} mail={mail} deleteItem={deleteHandler} isSentBox={false} />;
          })}
        </div>
      </div>
    </Fragment>
  );
};
export default Inbox;
