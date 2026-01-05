import { useContext } from "react";
import { UserContext } from "../context/UserContext";


const UseUserContext = () => {
  const { user, loading } = useContext(UserContext);

  return { user, loading };
};


export default UseUserContext;