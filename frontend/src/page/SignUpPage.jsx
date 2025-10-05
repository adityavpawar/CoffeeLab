import React ,{useState} from 'react'
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import { Link } from "react-router-dom"
import {
  Code,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";

import {z} from "zod";
const sigUpSchema = z.object({
  email:z.string().email("Enter a valid email"),
  passWord:z.string().min(6 , "Password must be atleast of 6 character"),
  name:z.string().min(3, "Name numst be atleast 3 character")
})
const SignUpPage = () => {

   const[showPassword, setShowPassword] = useState(false); 
   
   const {
     register,
     handleSubmit,
    formState: { errors }, 
  } = useForm({
    resolver: zodResolver(signUpSchema), 
  });

   const onSubmit = async (data) =>{
       console.log(data);
   }

   return (
    <div className='h-screen grid lg:grid-cols-2'>
      SignUpPage
    </div>
  )
}

export default SignUpPage
