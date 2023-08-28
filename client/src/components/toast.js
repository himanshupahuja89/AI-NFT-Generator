import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Toast() {

    return (
        <div>
            <ToastContainer
            position="top-right"
            autoClose={10000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            />
        </div>
    );
}

export default Toast;