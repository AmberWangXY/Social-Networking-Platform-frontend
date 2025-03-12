import React from 'react';
import { render, screen, fireEvent,within } from '@testing-library/react';
import Main from '../main/main';
import { MemoryRouter } from 'react-router-dom';

const mockSetIsLoggedIn = jest.fn();
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Main Component', () => {
    beforeEach(() => {
        global.fetch = jest.fn((url) =>
            Promise.resolve({
                json: () => {
                    if (url.includes('/users')) {
                        return Promise.resolve([
                            { id: 1, username: 'Bret', company: { catchPhrase: 'Hats off!' } },
                            { id: 2, username: 'Antonette', company: { catchPhrase: 'Amazing app!' } },

                        ]);
                    }
                    if (url.includes('/posts')) {
                        return Promise.resolve([
                            { id: 1, userId: 1, title: 'Post 1', body: 'Content of post 1' },
                            { id: 2, userId: 2, title: 'Post 2', body: 'Content of post 2' },
                        ]);
                    }
                },
            })
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('displays logged-in user’s information with a welcome message', async () => {
        render(
            <MemoryRouter>
                <Main setIsLoggedIn={mockSetIsLoggedIn} username="Bret" />
            </MemoryRouter>
        );

        expect(await screen.findByText(/Welcome, Bret/i)).toBeInTheDocument();
    });

    test('logs out when "Log Out" is clicked', () => {
        render(
            <MemoryRouter>
                <Main setIsLoggedIn={mockSetIsLoggedIn} username="Bret" />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText(/Log Out/i));

        expect(mockSetIsLoggedIn).toHaveBeenCalledWith(false);
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    test('Go to profile page', () => {
        render(
            <MemoryRouter>
                <Main setIsLoggedIn={mockSetIsLoggedIn} username="Bret" />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText(/Profile/i));

        expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });

    test('adds articles from a new follower to the feed', async () => {
        render(
            <MemoryRouter>
                <Main setIsLoggedIn={mockSetIsLoggedIn} username="Bret" />
            </MemoryRouter>
        );

        expect(await screen.findByText(/Content of post 1/i)).toBeInTheDocument();

        fireEvent.change(screen.getByPlaceholderText(/Search for user to follow/i), { target: { value: 'Antonette' } });
        fireEvent.click(screen.getByText(/Add/i));

        expect(await screen.findByText(/Content of post 2/i)).toBeInTheDocument();
    });

    test('removes articles of an unfollowed user from the feed', async () => {
        render(
            <MemoryRouter>
                <Main setIsLoggedIn={mockSetIsLoggedIn} username="Bret" />
            </MemoryRouter>
        );

        expect(await screen.findByText(/Content of post 1/i)).toBeInTheDocument();

        fireEvent.change(screen.getByPlaceholderText(/Search for user to follow/i), { target: { value: 'Antonette' } });
        fireEvent.click(screen.getByText(/Add/i));

        expect(await screen.findByText(/Content of post 2/i)).toBeInTheDocument();

        fireEvent.click(screen.getByText(/Unfollow/i, { selector: 'button' }));

        expect(screen.queryByText(/Content of post 2/i)).not.toBeInTheDocument();
    });

    test('search for an unfound user returns an alert', async () => {
        jest.spyOn(window, 'alert').mockImplementation(() => {});

        render(
            <MemoryRouter>
                <Main setIsLoggedIn={mockSetIsLoggedIn} username="Bret" />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/Search for user to follow/i), { target: { value: 'NonExistent' } });
        fireEvent.click(screen.getByText(/Add/i));
        expect(window.alert).toHaveBeenCalledWith('User not found');

    });



    test('allows user to update headline', async () => {
        render(
            <MemoryRouter>
                <Main setIsLoggedIn={mockSetIsLoggedIn} username="Bret" />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/Update your headline here/i), {
            target: { value: 'New headline text' },
        });
        fireEvent.click(screen.getByText(/Update/i));

        expect(await screen.findByText(/New headline text/i)).toBeInTheDocument();
    });

    test('shows no articles or followers for a new registered user', async () => {
        render(
            <MemoryRouter>
                <Main setIsLoggedIn={mockSetIsLoggedIn} username="NewUser" />
            </MemoryRouter>
        );

        expect(screen.queryByText(/Comments/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Unfollow/i)).not.toBeInTheDocument();
    });

    test('filter displayed articles by the search keyword (posts state is filtered)', async () => {
        render(
            <MemoryRouter>
                <Main setIsLoggedIn={mockSetIsLoggedIn} username="Bret" />
            </MemoryRouter>
        );

        // Initial articles should be loaded
        const article1 = await screen.findByText(/Content of post 1/i);
        const article2 = await screen.findByText(/Content of post 2/i);
        expect(article1).toBeInTheDocument();
        expect(article2).toBeInTheDocument();

        // Enter search term and click search
        fireEvent.change(screen.getByPlaceholderText(/Search articles by author or text.../i), { target: { value: 'Antonette' } });
        fireEvent.click(screen.getByText(/Search/i));

        // Expect only articles by the author "Antonette" to be displayed
        expect(screen.queryByText(/Content of post 1/i)).not.toBeInTheDocument();
        expect(await screen.findByText(/Content of post 2/i)).toBeInTheDocument();
    });

    test('clears search input and displays all articles when "Clear" button is clicked', async () => {
        render(
            <MemoryRouter>
                <Main setIsLoggedIn={mockSetIsLoggedIn} username="Bret" />
            </MemoryRouter>
        );


        fireEvent.change(screen.getByPlaceholderText(/Enter the title here.../i), { target: { value: 'title' } });

        fireEvent.change(screen.getByPlaceholderText(/Write your article here.../i), { target: { value: 'article' } });

        // Click the clear button to reset
        fireEvent.click(screen.getByText(/Clear/i));

        // Expect all articles to be displayed again
        expect(screen.getByPlaceholderText(/Enter the title here.../i)).toHaveValue('');
        expect(screen.getByPlaceholderText(/Write your article here.../i)).toHaveValue('');
    });

    test('newly posted article appears at the top', async () => {
        render(
            <MemoryRouter>
                <Main setIsLoggedIn={mockSetIsLoggedIn} username="Bret" />
            </MemoryRouter>
        );

        // 填写并发布新文章
        fireEvent.change(screen.getByPlaceholderText(/Enter the title here.../i), { target: { value: 'New Article Title' } });
        fireEvent.change(screen.getByPlaceholderText(/Write your article here.../i), { target: { value: 'Content of new article' } });
        fireEvent.click(screen.getByText(/Post Article/i));

        // 获取 articles-section 容器
        const articlesSection = screen.getByTestId('articles-section');
        // 检查第一个子元素的内容是否为新文章
        const articles = within(articlesSection).getAllByTestId('article');

        // 验证第一个文章内容
        expect(articles[0]).toHaveTextContent('New Article Title');
        expect(articles[0]).toHaveTextContent('Content of new article');
    });

});
