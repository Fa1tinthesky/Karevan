import {useMatch, Outlet} from 'react-router-dom'

const RegisterPage = () => {
  const match = useMatch("register/verfiy-email");
  
  
  if (match) return <Outlet/> 

  return (
    <div>
      Ragister Page
    </div>
  )
}

export default RegisterPage
