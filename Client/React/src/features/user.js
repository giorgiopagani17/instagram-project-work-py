import { createSlice } from '@reduxjs/toolkit'

export const user = createSlice({
  name: 'user',
  initialState: {
    value: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")):"",  /* Imposto il valore di default al valore dello storage di autenticazione cosi quando aggiorno la pagina lo tiene salvato */
  },
  reducers: {
    loginSuccess: (state,action) => { /* Login è una sorta di metodo */
   console.log(state);  
    state.value = action.payload;
    },
    logout: (state) => {
      state.value = false
    },
  },
})

// Action creators are generated for each case reducer function
export const { loginSuccess, logout } = user.actions

export default user.reducer