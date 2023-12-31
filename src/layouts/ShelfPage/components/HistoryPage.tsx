import { useOktaAuth } from "@okta/okta-react"
import { useState, useEffect } from "react";
import HistoryModel from "../../../models/HistoryModel";
import { SpinnerLoading } from "../../Utils/SpinnerLoading";
import { Link } from "react-router-dom";
import { Pagination } from "../../Utils/Pagination";


export const HistoryPage = () => {

    // Auth State
    const { authState } = useOktaAuth();

    // Histories
    const [histories, setHistories] = useState<HistoryModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [httpError, setHttpError] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);


    useEffect(() => {

        const fetchUserHistory = async () => {

            if (authState && authState.isAuthenticated) {

                const url = `${process.env.REACT_APP_API}/histories/search/findBooksByUserEmail?userEmail=${authState.accessToken?.claims.sub}&page=${currentPage - 1}&size=5`;
                const requestOptions = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }

                const fetchUserHistoryResponse = await fetch(url, requestOptions);

                if (!fetchUserHistoryResponse.ok) {
                    throw new Error('Something went wrong when fetching the history');
                }

                const fetchUserHistoryJson = await fetchUserHistoryResponse.json();

                setHistories(fetchUserHistoryJson._embedded.histories);
                setTotalPages(fetchUserHistoryJson.page.totalPages);
            }
            setIsLoading(false);
        }
        fetchUserHistory().catch((error: any) => {
            setHttpError(error.message);
            setIsLoading(false);
        })

    }, [authState, currentPage]);

    if (isLoading) {
        return (
            <SpinnerLoading />
        );
    }

    if (httpError) {
        return (
            <div className="container m-5">
                <p>{httpError}</p>
            </div>
        );
    }

    const paginate = (pageNumber: number) => { setCurrentPage(pageNumber) };

    return (
        <div className="mt-2">
            {
                histories.length > 0 ?
                    <>
                        <h5>Recent History:</h5>
                        {
                            histories.map(history => (

                                <div className="card mt-3 shadow p-3 mb-3 bg-body rounded">
                                    <div className="row g-0">
                                        <div className="col-md-2">
                                            <div className="d-none d-lg-block">

                                                {
                                                    history.img ?
                                                        <img src={history.img} width='123' height='196' alt="Book" />
                                                        :
                                                        <img src={require('../../../Images/BooksImages/book-luv2code-1000.png')}
                                                            width='123' height='196' alt="Default" />
                                                }
                                            </div>

                                            <div className="d-lg-none d-flex justify-content-center align-items-center">

                                                {
                                                    history.img ?
                                                        <img src={history.img} width='123' height='196' alt="Book" />
                                                        :
                                                        <img src={require('../../../Images/BooksImages/book-luv2code-1000.png')}
                                                            width='123' height='196' alt="Default" />
                                                }

                                            </div>
                                        </div>

                                        <div className="col">
                                            <div className="card-body">
                                                <h5 className="card-title">{history.author}</h5>
                                                <h4>{history.title}</h4>
                                                <p className="card-text">{history.description}</p>
                                                <hr />
                                                <p className="card-text">Checked out on: {history.checkoutDate}</p>
                                                <p className="card-text">Returned on: {history.returnedDate}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             ) )
                        }
                    </>
                    :
                    <>
                        <h3 className="mt-3">Currently no history: </h3>
                        <Link className="btn btn-primary" to={'search'}>Search for a new Book</Link>
                    </>
            }
            {
                totalPages>1&& <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate}/>
            }
        </div>
    );
}