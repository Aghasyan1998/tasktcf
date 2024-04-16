import "@aws-amplify/ui-react/styles.css";
import {
    withAuthenticator,
    Button,
    Heading,
    View,
    SearchField,
    Collection,
    Card,
    Text, Flex
} from "@aws-amplify/ui-react";
import {deleteAction} from "./graphql/mutations";
import {generateClient} from "aws-amplify/api";
import {listActions} from "./graphql/queries";
import {useEffect, useState} from "react";
import {ActionCreateForm} from "./ui-components";
import {useDebouncedCallback} from "use-debounce";

const API = generateClient();

function App({ signOut }) {
    const [actions, setActions] = useState([])

    async function fetchActions(search = '') {
        const apiData = await API.graphql({
            query: listActions,
            variables: {
                filter: {
                    name: {
                        contains: search
                    }
                }
            }
        })
        const actionsFromApi = apiData.data.listActions.items;
        setActions(actionsFromApi)
    }

    async function removeAction(item) {
        try {
            await API.graphql({
                query: deleteAction,
                variables: { input: { id: item.id } }
            })
            fetchActions()
        } catch (e) {
            console.log('Error deleting action:', e)
        }
    }

    useEffect(() => {
        fetchActions()
    }, []);

    const handleSearch = useDebouncedCallback(e => {
        fetchActions(e.target.value)
    }, 300);

    return (
        <View className="App">
            <Button display="block" onClick={signOut} margin="0 auto">Sign Out</Button>
            <Heading level={1} textAlign="center">My Actions</Heading>
            <View style={{ width: "300px" }} margin="0 auto">
                <ActionCreateForm onSuccess={() => fetchActions()}/>
                <SearchField
                    label="Search"
                    placeholder="Search here..."
                    onChange={handleSearch}
                    onClear={fetchActions}
                    hasSearchButton={false}
                />
            </View>
            <View>
                <Collection
                    type="list"
                    items={actions}
                    gap="1.5rem"
                >
                    {(item, index) => (
                        <Card key={index} padding="1rem">
                            <Flex
                                direction="row"
                                justifyContent="flex-start"
                                alignItems="flex-start"
                                alignContent="flex-start"
                                wrap="nowrap"
                                gap="1rem"
                            >
                                <View>
                                    <Text>{item.date}</Text>
                                    <Heading level={4}>{item.name}</Heading>
                                    <Text>{item.description}</Text>
                                </View>
                                <Button
                                    variation="primary"
                                    onClick={() => removeAction(item)}
                                >
                                    Delete
                                </Button>
                            </Flex>
                        </Card>
                    )}
                </Collection>
            </View>
        </View>
    );
}

export default withAuthenticator(App);